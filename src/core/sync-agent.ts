import { AwilixContainer, asValue, asClass } from "awilix";
import { ConnectorStatusResponse } from "../types/connector-status";
import { PrivateSettings, ConnectorReadType } from "./connector";
import {
  STATUS_SETUPREQUIRED_NOSITEID,
  STATUS_SETUPREQUIRED_NOAPIKEY,
  ERROR_UNHANDLED_GENERIC,
  SKIP_NOOP,
  ERROR_CHARGEBEEAPI_READ,
} from "./messages";
import { isNil, cloneDeep, sortBy, first, last } from "lodash";
import { Logger } from "winston";
import { LoggingUtil } from "../utils/logging-util";
import IHullClient from "../types/hull-client";
import { DateTime } from "luxon";
import { ConnectorRedisClient } from "../utils/redis-client";
import { ServiceClient } from "./service-client";
import {
  ApiResultObject,
  ListResult,
  Customer,
  Invoice,
  Card,
  Subscription,
  ChargebeeEvent,
  ChargebeeEventType,
} from "./service-objects";
import { AxiosError } from "axios";
import asyncForEach from "../utils/async-foreach";
import { MappingUtil } from "../utils/mapping-util";
import { HullUtil } from "../utils/hull-util";

const CHARGEBEE_MINDATE = DateTime.fromISO("2016-09-29T00:00:00.000Z");

export class SyncAgent {
  public readonly diContainer: AwilixContainer;

  constructor(container: AwilixContainer) {
    this.diContainer = container;
    const connectorMeta = this.diContainer.resolve("hullConnectorMeta") as any;
    this.diContainer.register(
      "hullAppSettings",
      asValue(connectorMeta.private_settings as PrivateSettings),
    );
    this.diContainer.register("loggingUtil", asClass(LoggingUtil).scoped());
    this.diContainer.register(
      "chargebeeApiKey",
      asValue(
        (connectorMeta.private_settings as PrivateSettings).chargebee_api_key,
      ),
    );
    this.diContainer.register(
      "chargebeeSite",
      asValue(
        (connectorMeta.private_settings as PrivateSettings).chargebee_site,
      ),
    );
    this.diContainer.register("serviceClient", asClass(ServiceClient).scoped());
    this.diContainer.register("mappingUtil", asClass(MappingUtil).scoped());
    this.diContainer.register("hullUtil", asClass(HullUtil).scoped());
  }

  public async fetchCustomers(readType: ConnectorReadType): Promise<void> {
    const logger = this.diContainer.resolve<Logger>("logger");
    const loggingUtil = this.diContainer.resolve<LoggingUtil>("loggingUtil");
    const correlationKey = this.diContainer.resolve<string>("correlationKey");
    const hullClient = this.diContainer.resolve<IHullClient>("hullClient");

    try {
      logger.info(
        loggingUtil.composeMetricMessage(
          "OPERATION_FETCHCUSTOMERS_COUNT",
          correlationKey,
          1,
        ),
      );
      const connectorSettings = this.diContainer.resolve<PrivateSettings>(
        "hullAppSettings",
      );

      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_FETCHCUSTOMERS_START",
          correlationKey,
        ),
      );

      hullClient.logger.info("incoming.job.start", {
        correlation_key: correlationKey,
        object_type: "customer",
        read_mode: readType,
      });

      if (
        connectorSettings.incoming_resolution_user === "none" &&
        connectorSettings.incoming_resolution_account === "none"
      ) {
        hullClient.logger.info("incoming.job.skip", {
          reason: SKIP_NOOP,
          correlation_key: correlationKey,
          object_type: "customer",
          read_mode: readType,
        });

        logger.info(
          loggingUtil.composeOperationalMessage(
            "OPERATION_FETCHCUSTOMERS_NOOP",
            correlationKey,
          ),
        );
        return;
      }

      const connectorId = this.diContainer.resolve<string>("hullAppId");
      const redisClient = this.diContainer.resolve<ConnectorRedisClient>(
        "redisClient",
      );
      const serviceClient = this.diContainer.resolve<ServiceClient>(
        "serviceClient",
      );
      const mappingUtil = this.diContainer.resolve<MappingUtil>("mappingUtil");

      let updatedAfter = DateTime.fromISO("2016-09-29T00:00:00.000Z");
      const currentRunStart = DateTime.utc().toISO();

      // Check if a lock is present
      let currentLock = await redisClient.get<string>(
        `${connectorId}_customers_lock`,
      );

      if (currentLock !== undefined) {
        logger.info(
          loggingUtil.composeOperationalMessage(
            "OPERATION_FETCHCUSTOMERS_SKIPLOCK",
            correlationKey,
          ),
        );
        return;
      }

      // Set a lock to prevent parallel fetches (auto-expire after 6 hours)
      await redisClient.set<string>(
        `${connectorId}_customers_lock`,
        correlationKey,
        60 * 60 * 6,
      );

      if (readType === "incremental") {
        const latestCached = await redisClient.get<string>(
          `${connectorId}_customers_last`,
        );
        if (latestCached !== undefined) {
          updatedAfter = DateTime.fromISO(latestCached);
        }
      }

      let hasMore: boolean = true;
      let nextOffset: string | undefined = undefined;
      while (hasMore) {
        logger.info(
          loggingUtil.composeMetricMessage(
            "OPERATION_SVCLIENTAPICALL_COUNT",
            correlationKey,
            1,
          ),
        );
        const responseCustomers: ApiResultObject<
          undefined,
          ListResult<{ customer: Customer }>,
          AxiosError
        > = await serviceClient.listCustomers(
          updatedAfter.toISO() as string,
          nextOffset,
          false,
        );
        if (responseCustomers.success === false) {
          logger.error(
            loggingUtil.composeErrorMessage(
              "OPERATION_FETCHCUSTOMERS_APIFAIL",
              responseCustomers.errorDetails,
              correlationKey,
            ),
          );

          throw new Error(ERROR_CHARGEBEEAPI_READ("customer"));
        }
        if (responseCustomers.data) {
          nextOffset = responseCustomers.data.next_offset;
          await asyncForEach(
            responseCustomers.data.list,
            async (listItem: { customer: Customer }) => {
              if (connectorSettings.incoming_resolution_user !== "none") {
                const userIdent = mappingUtil.mapCustomerToIdentityUser(
                  listItem.customer,
                );
                const userAttribs = mappingUtil.mapCustomerToAttributesUser(
                  listItem.customer,
                );
                await hullClient.asUser(userIdent).traits(userAttribs);
              }

              if (connectorSettings.incoming_resolution_account !== "none") {
                const acctIdent = mappingUtil.mapCustomerToIdentityAccount(
                  listItem.customer,
                );
                const acctAttribs = mappingUtil.mapCustomerToAttributesAccount(
                  listItem.customer,
                );
                await hullClient.asAccount(acctIdent).traits(acctAttribs);
              }
            },
          );
        } else {
          nextOffset = undefined;
        }

        hasMore = !isNil(nextOffset);
      }

      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_FETCHCUSTOMERS_UPDATELASTRUNCACHE_START",
          correlationKey,
        ),
      );
      await redisClient.set(
        `${connectorId}_customers_last`,
        currentRunStart,
        24 * 60 * 60,
      );

      hullClient.logger.info("incoming.job.success", {
        correlation_key: correlationKey,
        object_type: "customer",
        read_mode: readType,
      });

      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_FETCHCUSTOMERS_SUCCESS",
          correlationKey,
        ),
      );
    } catch (error) {
      console.error(error);
      logger.error(
        loggingUtil.composeErrorMessage(
          "OPERATION_FETCHCUSTOMERS_UNHANDLED",
          cloneDeep(error),
          correlationKey,
        ),
      );

      hullClient.logger.error("incoming.job.error", {
        error: error.message,
        correlation_key: correlationKey,
        object_type: "customer",
        read_mode: readType,
      });
    } finally {
      // Release the lock, regardless of the outcome of the operation
      try {
        const connectorId = this.diContainer.resolve<string>("hullAppId");
        const redisClient = this.diContainer.resolve<ConnectorRedisClient>(
          "redisClient",
        );
        await redisClient.delete(`${connectorId}_customers_lock`);
      } catch (error) {
        logger.error(
          loggingUtil.composeErrorMessage(
            "OPERATION_FETCHCUSTOMERS_RELEASELOCKFAIL",
            error,
            correlationKey,
          ),
        );
      }
    }
  }

  public async fetchInvoices(readType: ConnectorReadType): Promise<void> {
    const logger = this.diContainer.resolve<Logger>("logger");
    const loggingUtil = this.diContainer.resolve<LoggingUtil>("loggingUtil");
    const correlationKey = this.diContainer.resolve<string>("correlationKey");
    const hullClient = this.diContainer.resolve<IHullClient>("hullClient");

    try {
      logger.info(
        loggingUtil.composeMetricMessage(
          "OPERATION_FETCHINVOICES_COUNT",
          correlationKey,
          1,
        ),
      );

      const connectorSettings = this.diContainer.resolve<PrivateSettings>(
        "hullAppSettings",
      );

      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_FETCHINVOICES_START",
          correlationKey,
        ),
      );

      hullClient.logger.info("incoming.job.start", {
        correlation_key: correlationKey,
        object_type: "invoice",
        read_mode: readType,
      });

      if (
        connectorSettings.incoming_resolution_user === "none" &&
        connectorSettings.incoming_resolution_account === "none"
      ) {
        hullClient.logger.info("incoming.job.skip", {
          reason: SKIP_NOOP,
          correlation_key: correlationKey,
          object_type: "customer",
          read_mode: readType,
        });

        logger.info(
          loggingUtil.composeOperationalMessage(
            "OPERATION_FETCHINVOICES_NOOP",
            correlationKey,
          ),
        );
        return;
      }

      const connectorId = this.diContainer.resolve<string>("hullAppId");
      const redisClient = this.diContainer.resolve<ConnectorRedisClient>(
        "redisClient",
      );
      const serviceClient = this.diContainer.resolve<ServiceClient>(
        "serviceClient",
      );
      const mappingUtil = this.diContainer.resolve<MappingUtil>("mappingUtil");

      let updatedAfter = DateTime.fromISO("2016-09-29T00:00:00.000Z");
      const currentRunStart = DateTime.utc().toISO();

      // Check if a lock is present
      let currentLock = await redisClient.get<string>(
        `${connectorId}_invoices_lock`,
      );

      if (currentLock !== undefined) {
        logger.info(
          loggingUtil.composeOperationalMessage(
            "OPERATION_FETCHINVOICES_SKIPLOCK",
            correlationKey,
          ),
        );
        return;
      }

      // Set a lock to prevent parallel fetches (auto-expire after 6 hours)
      await redisClient.set<string>(
        `${connectorId}_invoices_lock`,
        correlationKey,
        60 * 60 * 6,
      );

      if (readType === "incremental") {
        const latestCached = await redisClient.get<string>(
          `${connectorId}_invoices_last`,
        );
        if (latestCached !== undefined) {
          updatedAfter = DateTime.fromISO(latestCached);
        }
      }

      let hasMore: boolean = true;
      let nextOffset: string | undefined = undefined;
      while (hasMore) {
        logger.info(
          loggingUtil.composeMetricMessage(
            "OPERATION_SVCLIENTAPICALL_COUNT",
            correlationKey,
            1,
          ),
        );
        const responseInvoices: ApiResultObject<
          undefined,
          ListResult<{ invoice: Invoice }>,
          AxiosError
        > = await serviceClient.listInvoices(
          updatedAfter.toISO() as string,
          nextOffset,
          false,
        );
        if (responseInvoices.success === false) {
          logger.error(
            loggingUtil.composeErrorMessage(
              "OPERATION_FETCHCUSTOMERS_APIFAIL",
              responseInvoices.errorDetails,
              correlationKey,
            ),
          );

          throw new Error(ERROR_CHARGEBEEAPI_READ("invoice"));
        }
        if (responseInvoices.data) {
          nextOffset = responseInvoices.data.next_offset;
          await asyncForEach(
            responseInvoices.data.list,
            async (listItem: { invoice: Invoice }) => {
              if (connectorSettings.incoming_resolution_user !== "none") {
                const userIdent = {
                  anonymous_id: `chargebee:${listItem.invoice.customer_id}`,
                };
                const userEvent = mappingUtil.mapInvoiceToUserEvent(
                  listItem.invoice,
                );
                await hullClient
                  .asUser(userIdent)
                  .track(
                    userEvent.event,
                    userEvent.properties,
                    userEvent.context,
                  );
              }

              if (
                connectorSettings.incoming_resolution_account !== "none" &&
                connectorSettings.aggregation_account_invoices === true
              ) {
                let customerInvoices = await redisClient.get<Array<Invoice>>(
                  `${connectorId}_${listItem.invoice.customer_id}_invoices`,
                );
                if (isNil(customerInvoices)) {
                  customerInvoices = await this.fetchInvoicesForCustomer(
                    DateTime.fromISO("2016-09-29T00:00:00.000Z"),
                    listItem.invoice.customer_id,
                    serviceClient,
                    logger,
                    loggingUtil,
                    correlationKey,
                  );
                  await redisClient.set(
                    `${connectorId}_${listItem.invoice.customer_id}_invoices`,
                    customerInvoices,
                    60 * 15,
                  );
                }

                const sortedInvoices = sortBy(customerInvoices, ["date"]);
                const oldestInvoice = first(sortedInvoices) as Invoice;
                const latestInvoice = last(sortedInvoices) as Invoice;
                // Updated first and latest invoice

                const oldestInvoiceAttribs = mappingUtil.mapInvoiceAggregationToAttributesAccount(
                  "first",
                  oldestInvoice,
                );
                const latestInvoiceAttribs = mappingUtil.mapInvoiceAggregationToAttributesAccount(
                  "last",
                  latestInvoice,
                );

                await hullClient
                  .asAccount({
                    external_id: listItem.invoice.customer_id,
                    anonymous_id: `chargebee:${listItem.invoice.customer_id}`,
                  })
                  .traits({
                    ...oldestInvoiceAttribs,
                    ...latestInvoiceAttribs,
                  });
              }
            },
          );
        } else {
          nextOffset = undefined;
        }

        hasMore = !isNil(nextOffset);
      }

      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_FETCHINVOICES_UPDATELASTRUNCACHE_START",
          correlationKey,
        ),
      );

      await redisClient.set(
        `${connectorId}_invoices_last`,
        currentRunStart,
        24 * 60 * 60,
      );

      hullClient.logger.info("incoming.job.success", {
        correlation_key: correlationKey,
        object_type: "invoice",
        read_mode: readType,
      });

      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_FETCHINVOICES_SUCCESS",
          correlationKey,
        ),
      );
    } catch (error) {
      console.error(error);
      logger.error(
        loggingUtil.composeErrorMessage(
          "OPERATION_FETCHINVOICES_UNHANDLED",
          cloneDeep(error),
          correlationKey,
        ),
      );

      hullClient.logger.error("incoming.job.error", {
        error: error.message,
        correlation_key: correlationKey,
        object_type: "invoice",
        read_mode: readType,
      });
    } finally {
      // Release the lock, regardless of the outcome of the operation
      try {
        const connectorId = this.diContainer.resolve<string>("hullAppId");
        const redisClient = this.diContainer.resolve<ConnectorRedisClient>(
          "redisClient",
        );
        await redisClient.delete(`${connectorId}_invoices_lock`);
      } catch (error) {
        logger.error(
          loggingUtil.composeErrorMessage(
            "OPERATION_FETCHINVOICES_RELEASELOCKFAIL",
            error,
            correlationKey,
          ),
        );
      }
    }
  }

  public async fetchEvents(): Promise<void> {
    const logger = this.diContainer.resolve<Logger>("logger");
    const loggingUtil = this.diContainer.resolve<LoggingUtil>("loggingUtil");
    const correlationKey = this.diContainer.resolve<string>("correlationKey");
    const hullClient = this.diContainer.resolve<IHullClient>("hullClient");
    const hullUtil = this.diContainer.resolve<HullUtil>("hullUtil");

    const currentRunStart = DateTime.utc().toISO();
    try {
      logger.info(
        loggingUtil.composeMetricMessage(
          "OPERATION_FETCHEVENTS_COUNT",
          correlationKey,
          1,
        ),
      );

      const connectorSettings = this.diContainer.resolve<PrivateSettings>(
        "hullAppSettings",
      );

      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_FETCHEVENTS_START",
          correlationKey,
        ),
      );

      hullClient.logger.info("incoming.job.start", {
        correlation_key: correlationKey,
        object_type: "events",
        read_mode: "incremental",
      });

      const connectorId = this.diContainer.resolve<string>("hullAppId");
      const redisClient = this.diContainer.resolve<ConnectorRedisClient>(
        "redisClient",
      );
      const serviceClient = this.diContainer.resolve<ServiceClient>(
        "serviceClient",
      );
      const mappingUtil = this.diContainer.resolve<MappingUtil>("mappingUtil");

      // Check if a lock is present
      let currentLock = await redisClient.get<string>(
        `${connectorId}_events_lock`,
      );

      if (currentLock !== undefined) {
        logger.info(
          loggingUtil.composeOperationalMessage(
            "OPERATION_FETCHEVENTS_SKIPLOCK",
            correlationKey,
          ),
        );
        return;
      }

      await redisClient.set(
        `${connectorId}_events_lock`,
        currentRunStart,
        60 * 15,
      );

      // Get the latest cached run date
      let occurredAfter = DateTime.utc().minus({ hours: 1 });
      const latestCached = await redisClient.get<string>(
        `${connectorId}_events_last`,
      );
      if (latestCached !== undefined) {
        occurredAfter = DateTime.fromISO(latestCached);
      }

      // Retrieve all events
      const events: ChargebeeEventType[] = [
        "customer_created",
        "customer_changed",
        "customer_deleted",
        "invoice_generated",
        "invoice_updated",
        "invoice_deleted",
        "subscription_created",
        "subscription_changed",
        "subscription_deleted",
        "subscription_cancelled",
        "subscription_activated",
        "subscription_reactivated",
        "subscription_renewed",
        "subscription_paused",
        "subscription_resumed",
        "subscription_cancellation_scheduled",
        "subscription_scheduled_cancellation_removed",
        "subscription_changes_scheduled",
        "subscription_scheduled_changes_removed",
        "subscription_pause_scheduled",
        "subscription_scheduled_pause_removed",
        "subscription_resumption_scheduled",
        "subscription_scheduled_resumption_removed",
      ];
      let hasMore: boolean = true;
      let nextOffset: string | undefined = undefined;
      const customerIdsToFetchSubscriptions: string[] = [];
      const customerIdsToFetchInvoices: string[] = [];
      let numAPICalls = 0;
      while (hasMore) {
        numAPICalls += 1;
        logger.info("incoming.job.progress", {
            job: "fetch-events",
            status: "pre-api-call",
            occurredAfter,
            offset: isNil(nextOffset) ? "" : nextOffset
          }
        );

        const responseEvents: ApiResultObject<
          undefined,
          ListResult<{ event: ChargebeeEvent }>,
          AxiosError
        > = await serviceClient.listEvents(
          occurredAfter.toISO() as string,
          events,
          nextOffset,
        );

        logger.info("incoming.job.progress", {
          job: "fetch-events",
          status: "post-api-call",
          success: responseEvents.success,
          numAPICalls
        });

        if (responseEvents.success === false) {
          logger.info(
            loggingUtil.composeErrorMessage(
              "OPERATION_FETCHEVENTS_APIFAIL",
              responseEvents.errorDetails,
              correlationKey,
            ),
          );

          throw new Error(ERROR_CHARGEBEEAPI_READ("events"));
        }
        if (responseEvents.data) {
          logger.info("incoming.job.progress", {
              job: "fetch-events",
              status: "processing-page",
              size: responseEvents.data.list.length
            }
          );
          nextOffset = responseEvents.data.next_offset;
          await asyncForEach(
            responseEvents.data.list,
            async (listItem: { event: ChargebeeEvent }) => {
              const eventOccurence = DateTime.fromSeconds(
                listItem.event.occurred_at,
              );
              if (eventOccurence < occurredAfter) {
                try {
                  logger.info("incoming.job.progress", {
                      job: "fetch-events",
                      status: "skip-event",
                      customerId: isNil(listItem.event.content.customer) ? "unknown" : listItem.event.content.customer.id,
                      subscription: isNil(listItem.event.content.subscription) ? "unknown" : listItem.event.content.subscription
                    }
                  );
                } catch(er) {}
                return;
              }
              const incomingResults = mappingUtil.mapChargebeeEventIncoming(
                listItem.event,
              );
              await hullUtil.processIncomingData(incomingResults);
              // If we receive a subscription event, add the customer id to the list if handling of accounts is active
              if (
                connectorSettings.incoming_resolution_account !== "none" &&
                connectorSettings.aggregation_account_subscriptions
              ) {
                if (
                  listItem.event.event_type.startsWith("subscription_") &&
                  !isNil(listItem.event.content.subscription)
                ) {
                  if (
                    !customerIdsToFetchSubscriptions.includes(
                      listItem.event.content.subscription.customer_id,
                    )
                  ) {
                    customerIdsToFetchSubscriptions.push(
                      listItem.event.content.subscription.customer_id,
                    );
                  }
                }
              }
              // If we receive an invoice event, add the customer id to the list if handling of accounts is active
              if (
                connectorSettings.incoming_resolution_account !== "none" &&
                connectorSettings.aggregation_account_invoices
              ) {
                if (
                  listItem.event.event_type.startsWith("invoice_") &&
                  !isNil(listItem.event.content.invoice)
                ) {
                  if (
                    !customerIdsToFetchInvoices.includes(
                      listItem.event.content.invoice.customer_id,
                    )
                  ) {
                    customerIdsToFetchInvoices.push(
                      listItem.event.content.invoice.customer_id,
                    );
                  }
                }
              }
            },
          );
        } else {
          nextOffset = undefined;
        }

        hasMore = !isNil(nextOffset);
        logger.info("incoming.job.progress", { job: "fetch-events", status: "page-finished", hasMore });
        await redisClient.set(
          `${connectorId}_events_lock`,
          currentRunStart,
          60 * 15,
        );
      }

      logger.info("incoming.job.progress", { job: "fetch-events", status: "fetch-events-finished" });

      // If we have subscriptions to process for accounts, execute
      logger.info("incoming.job.progress", {
        step: "fetch-subscriptions",
        customerIds: customerIdsToFetchSubscriptions
      });
      if (customerIdsToFetchSubscriptions.length !== 0) {
        await asyncForEach(
          customerIdsToFetchSubscriptions,
          async (customerId: string) => {

            const subscriptions = await this.fetchSubscriptionsForCustomer(
              CHARGEBEE_MINDATE,
              customerId,
              serviceClient,
              logger,
              loggingUtil,
              correlationKey,
            );

            const subResults = mappingUtil.mapCustomerSubscriptionsToAttributesAccount(
              customerId,
              subscriptions,
            );

            await hullUtil.processIncomingData(subResults);

            await redisClient.set(
              `${connectorId}_events_lock`,
              currentRunStart,
              60 * 15,
            );
          },
        );
      }

      logger.info("incoming.job.progress", {
        step: "fetch-invoices",
        customerIds: customerIdsToFetchInvoices
      });
      // If we have invoices to process for accounts, execute
      if (customerIdsToFetchInvoices.length !== 0) {
        await asyncForEach(
          customerIdsToFetchInvoices,
          async (customerId: string) => {
            const invoices = await this.fetchInvoicesForCustomer(
              CHARGEBEE_MINDATE,
              customerId,
              serviceClient,
              logger,
              loggingUtil,
              correlationKey,
            );

            const invoiceResults = mappingUtil.mapCustomerInvoicesToAttributesAccount(
              customerId,
              invoices,
            );
            await hullUtil.processIncomingData(invoiceResults);
            await redisClient.set(
              `${connectorId}_events_lock`,
              currentRunStart,
              60 * 15,
            );
          },
        );
      }
      // Update the latest run date
      await redisClient.set(
        `${connectorId}_events_last`,
        currentRunStart,
        24 * 60 * 60,
      );

      hullClient.logger.info("incoming.job.success", {
        correlation_key: correlationKey,
        object_type: "events",
        read_mode: "incremental",
      });

      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_FETCHINVOICES_SUCCESS",
          correlationKey,
        ),
      );
    } catch (error) {
      console.error(error);
      logger.info(
        loggingUtil.composeErrorMessage(
          "OPERATION_FETCHEVENTS_UNHANDLED",
          cloneDeep(error),
          correlationKey,
        ),
      );

      hullClient.logger.info("incoming.job.error", {
        error: error.message,
        correlation_key: correlationKey,
        object_type: "events",
        read_mode: "incremental",
      });
    } finally {
      // Release the lock, regardless of the outcome of the operation
      try {
        const connectorId = this.diContainer.resolve<string>("hullAppId");
        const redisClient = this.diContainer.resolve<ConnectorRedisClient>(
          "redisClient",
        );
        await redisClient.delete(`${connectorId}_events_lock`);
      } catch (error) {
        logger.error(
          loggingUtil.composeErrorMessage(
            "OPERATION_FETCHEVENTS_RELEASELOCKFAIL",
            error,
            correlationKey,
          ),
        );
      }
    }
  }

  private async fetchInvoicesForCustomer(
    updatedAfter: DateTime,
    customerId: string,
    serviceClient: ServiceClient,
    logger: Logger,
    loggingUtil: LoggingUtil,
    correlationKey?: string,
  ): Promise<Array<Invoice>> {
    let hasMore: boolean = true;
    let nextOffset: string | undefined = undefined;
    const result: Array<Invoice> = [];

    while (hasMore) {
      logger.info(
        loggingUtil.composeMetricMessage(
          "OPERATION_SVCLIENTAPICALL_COUNT",
          correlationKey,
          1,
        ),
      );
      const responseInvoices: ApiResultObject<
        undefined,
        ListResult<{ invoice: Invoice }>,
        AxiosError
      > = await serviceClient.listInvoices(
        updatedAfter.toISO() as string,
        nextOffset,
        false,
        [customerId],
      );
      if (responseInvoices.success === false) {
        throw new Error(ERROR_CHARGEBEEAPI_READ("customer"));
      }
      if (responseInvoices.data) {
        nextOffset = responseInvoices.data.next_offset;
        const invoicesList = responseInvoices.data.list.map(
          (li: { invoice: Invoice }) => li.invoice,
        );
        result.push(...invoicesList);
      } else {
        nextOffset = undefined;
      }

      hasMore = !isNil(nextOffset);
    }

    return result;
  }

  public async fetchSubscriptions(readType: ConnectorReadType): Promise<void> {
    const logger = this.diContainer.resolve<Logger>("logger");
    const loggingUtil = this.diContainer.resolve<LoggingUtil>("loggingUtil");
    const correlationKey = this.diContainer.resolve<string>("correlationKey");
    const hullClient = this.diContainer.resolve<IHullClient>("hullClient");

    try {
      logger.info(
        loggingUtil.composeMetricMessage(
          "OPERATION_FETCHSUBSCRIPIONS_COUNT",
          correlationKey,
          1,
        ),
      );

      const connectorSettings = this.diContainer.resolve<PrivateSettings>(
        "hullAppSettings",
      );

      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_FETCHSUBSCRIPTIONS_START",
          correlationKey,
        ),
      );

      hullClient.logger.info("incoming.job.start", {
        correlation_key: correlationKey,
        object_type: "customer",
        read_mode: readType,
      });

      if (
        connectorSettings.incoming_resolution_user === "none" &&
        connectorSettings.incoming_resolution_account === "none"
      ) {
        hullClient.logger.info("incoming.job.skip", {
          reason: SKIP_NOOP,
          correlation_key: correlationKey,
          object_type: "subscription",
          read_mode: readType,
        });

        logger.info(
          loggingUtil.composeOperationalMessage(
            "OPERATION_FETCHSUBSCRIPTIONS_NOOP",
            correlationKey,
          ),
        );
      }

      const connectorId = this.diContainer.resolve<string>("hullAppId");
      const redisClient = this.diContainer.resolve<ConnectorRedisClient>(
        "redisClient",
      );
      const serviceClient = this.diContainer.resolve<ServiceClient>(
        "serviceClient",
      );
      const mappingUtil = this.diContainer.resolve<MappingUtil>("mappingUtil");

      // Check if a lock is present
      let currentLock = await redisClient.get<string>(
        `${connectorId}_subscriptions_lock`,
      );

      if (currentLock !== undefined) {
        logger.info(
          loggingUtil.composeOperationalMessage(
            "OPERATION_FETCHSUBSCRIPTIONS_SKIPLOCK",
            correlationKey,
          ),
        );
        return;
      }

      // Set a lock to prevent parallel fetches (auto-expire after 6 hours)
      await redisClient.set<string>(
        `${connectorId}_subscriptions_lock`,
        correlationKey,
        60 * 60 * 6,
      );

      let updatedAfter = DateTime.fromISO("2016-09-29T00:00:00.000Z");
      const currentRunStart = DateTime.utc().toISO();

      if (readType === "incremental") {
        const latestCached = await redisClient.get<string>(
          `${connectorId}_subscriptions_last`,
        );
        if (latestCached !== undefined) {
          updatedAfter = DateTime.fromISO(latestCached);
        }
      }

      let hasMore: boolean = true;
      let nextOffset: string | undefined = undefined;
      while (hasMore) {
        logger.info(
          loggingUtil.composeMetricMessage(
            "OPERATION_SVCLIENTAPICALL_COUNT",
            correlationKey,
            1,
          ),
        );
        const responseSubscriptions: ApiResultObject<
          undefined,
          ListResult<{
            subscription: Subscription;
            customer: Customer;
            card?: Card;
          }>,
          AxiosError
        > = await serviceClient.listSubscriptions(
          updatedAfter.toISO() as string,
          nextOffset,
          false,
        );
        if (responseSubscriptions.success === false) {
          logger.error(
            loggingUtil.composeErrorMessage(
              "OPERATION_FETCHSUBSCRIPTIONS_APIFAIL",
              responseSubscriptions.errorDetails,
              correlationKey,
            ),
          );

          throw new Error(ERROR_CHARGEBEEAPI_READ("subscription"));
        }
        if (responseSubscriptions.data) {
          nextOffset = responseSubscriptions.data.next_offset;
          await asyncForEach(
            responseSubscriptions.data.list,
            async (listItem: {
              subscription: Subscription;
              customer: Customer;
              card?: Card;
            }) => {
              if (connectorSettings.incoming_resolution_user !== "none") {
                const userIdent = mappingUtil.mapCustomerToIdentityUser(
                  listItem.customer,
                );
                const userEvent = mappingUtil.mapSubscriptionToUserEvent(
                  listItem.subscription,
                );
                await hullClient
                  .asUser(userIdent)
                  .track(
                    userEvent.event,
                    userEvent.properties,
                    userEvent.context,
                  );
              }

              if (
                connectorSettings.incoming_resolution_account !== "none" &&
                connectorSettings.aggregation_account_subscriptions === true
              ) {
                let customerSubscriptions = await redisClient.get<
                  Array<Subscription>
                >(`${connectorId}_${listItem.customer.id}_subscriptions`);
                if (isNil(customerSubscriptions)) {
                  customerSubscriptions = await this.fetchSubscriptionsForCustomer(
                    DateTime.fromISO("2016-09-29T00:00:00.000Z"),
                    listItem.customer.id,
                    serviceClient,
                    logger,
                    loggingUtil,
                    correlationKey,
                  );
                  await redisClient.set(
                    `${connectorId}_${listItem.customer.id}_subscriptions`,
                    customerSubscriptions,
                    60 * 15,
                  );
                }

                const sortedSubscriptions = sortBy(customerSubscriptions, [
                  "date",
                ]);
                const acctIdent = mappingUtil.mapCustomerToIdentityAccount(
                  listItem.customer,
                );
                if (sortedSubscriptions.length > 5) {
                  // Sample subscriptions (take first 4 and latest)
                  for (let index = 0; index < 5; index++) {
                    const element = sortedSubscriptions[index];
                    const subAttribs = mappingUtil.mapSubscriptionToAttributesAccount(
                      index,
                      element,
                    );
                    await hullClient.asAccount(acctIdent).traits(subAttribs);
                  }

                  const latestSubscription = last(
                    sortedSubscriptions,
                  ) as Subscription;
                  const subAttribsLatest = mappingUtil.mapSubscriptionToAttributesAccount(
                    5,
                    latestSubscription,
                  );
                  await hullClient
                    .asAccount(acctIdent)
                    .traits(subAttribsLatest);
                } else {
                  for (
                    let index = 0;
                    index < sortedSubscriptions.length;
                    index++
                  ) {
                    const element = sortedSubscriptions[index];
                    const subAttribs = mappingUtil.mapSubscriptionToAttributesAccount(
                      index,
                      element,
                    );
                    await hullClient.asAccount(acctIdent).traits(subAttribs);
                  }
                }
              }
            },
          );
        } else {
          nextOffset = undefined;
        }

        hasMore = !isNil(nextOffset);
      }

      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_FETCHSUBSCRIPTIONS_UPDATELASTRUNCACHE_START",
          correlationKey,
        ),
      );

      await redisClient.set(
        `${connectorId}_subscriptions_last`,
        currentRunStart,
        24 * 60 * 60,
      );

      hullClient.logger.info("incoming.job.success", {
        correlation_key: correlationKey,
        object_type: "subscription",
        read_mode: readType,
      });

      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_FETCHSUBSCRIPTIONS_SUCCESS",
          correlationKey,
        ),
      );
    } catch (error) {
      console.error(error);
      logger.error(
        loggingUtil.composeErrorMessage(
          "OPERATION_FETCHSUBSCRIPTIONS_UNHANDLED",
          cloneDeep(error),
          correlationKey,
        ),
      );
      hullClient.logger.error("incoming.job.error", {
        error: error.message,
        correlation_key: correlationKey,
        object_type: "subscription",
        read_mode: readType,
      });
    } finally {
      // Release the lock, regardless of the outcome of the operation
      try {
        const connectorId = this.diContainer.resolve<string>("hullAppId");
        const redisClient = this.diContainer.resolve<ConnectorRedisClient>(
          "redisClient",
        );
        await redisClient.delete(`${connectorId}_subscriptions_lock`);
      } catch (error) {
        logger.error(
          loggingUtil.composeErrorMessage(
            "OPERATION_FETCHSUBSCRIPTIONS_RELEASELOCKFAIL",
            error,
            correlationKey,
          ),
        );
      }
    }
  }

  getCustomerSubscriptions(customerId: string) {
    const serviceClient = this.diContainer.resolve<ServiceClient>(
      "serviceClient",
    );
    const logger = this.diContainer.resolve<Logger>("logger");
    const loggingUtil = this.diContainer.resolve<LoggingUtil>("loggingUtil");
    const correlationKey = this.diContainer.resolve<string>("correlationKey");

    return this.fetchSubscriptionsForCustomer(
      CHARGEBEE_MINDATE,
      customerId,
      serviceClient,
      logger,
      loggingUtil,
      correlationKey,
    );
  }

  private async fetchSubscriptionsForCustomer(
    updatedAfter: DateTime,
    customerId: string,
    serviceClient: ServiceClient,
    logger: Logger,
    loggingUtil: LoggingUtil,
    correlationKey?: string,
  ): Promise<Array<Subscription>> {
    let hasMore: boolean = true;
    let nextOffset: string | undefined = undefined;
    const result: Array<Subscription> = [];

    while (hasMore) {
      logger.info(
        loggingUtil.composeMetricMessage(
          "OPERATION_SVCLIENTAPICALL_COUNT",
          correlationKey,
          1,
        ),
      );
      const responseSubscriptions: ApiResultObject<
        undefined,
        ListResult<{
          subscription: Subscription;
          customer: Customer;
          card?: Card;
        }>,
        AxiosError
      > = await serviceClient.listSubscriptions(
        updatedAfter.toISO() as string,
        nextOffset,
        false,
        [customerId],
      );
      if (responseSubscriptions.success === false) {
        throw new Error(ERROR_CHARGEBEEAPI_READ("subscription"));
      }
      if (responseSubscriptions.data) {
        nextOffset = responseSubscriptions.data.next_offset;
        const subscriptionsList = responseSubscriptions.data.list.map(
          (li: {
            subscription: Subscription;
            customer: Customer;
            card?: Card;
          }) => li.subscription,
        );
        result.push(...subscriptionsList);
      } else {
        nextOffset = undefined;
      }

      hasMore = !isNil(nextOffset);
    }

    return result;
  }

  /**
   * Determines the overall status of the connector.
   *
   * @returns {Promise<ConnectorStatusResponse>} The status response.
   * @memberof SyncAgent
   */
  public async determineConnectorStatus(): Promise<ConnectorStatusResponse> {
    const logger = this.diContainer.resolve<Logger>("logger");
    const loggingUtil = this.diContainer.resolve<LoggingUtil>("loggingUtil");
    const correlationKey = this.diContainer.resolve<string>("correlationKey");

    const statusResult: ConnectorStatusResponse = {
      status: "ok",
      messages: [],
    };

    try {
      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_CONNECTORSTATUS_START",
          correlationKey,
        ),
      );

      const connectorSettings = this.diContainer.resolve<PrivateSettings>(
        "hullAppSettings",
      );
      const hullClient = this.diContainer.resolve<IHullClient>("hullClient");
      const connectorId = this.diContainer.resolve<string>("hullAppId");

      // Perfom checks to verify setup is complete
      if (isNil(connectorSettings.chargebee_site)) {
        statusResult.status = "setupRequired";
        statusResult.messages.push(STATUS_SETUPREQUIRED_NOSITEID);
      }

      if (isNil(connectorSettings.chargebee_api_key)) {
        statusResult.status = "setupRequired";
        statusResult.messages.push(STATUS_SETUPREQUIRED_NOAPIKEY);
      }

      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_CONNECTORSTATUS_STARTHULLAPI",
          correlationKey,
        ),
      );

      await hullClient.put(`${connectorId}/status`, statusResult);

      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_CONNECTORSTATUS_SUCCESS",
          correlationKey,
        ),
      );
    } catch (error) {
      const logPayload = loggingUtil.composeErrorMessage(
        "OPERATION_CONNECTORSTATUS_UNHANDLED",
        cloneDeep(error),
        correlationKey,
      );
      logger.error(logPayload);
      statusResult.status = "error";
      if (logPayload && logPayload.message) {
        statusResult.messages.push(logPayload.message);
      } else {
        statusResult.messages.push(ERROR_UNHANDLED_GENERIC);
      }
    }

    return statusResult;
  }
}
