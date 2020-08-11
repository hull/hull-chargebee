import { PrivateSettings } from "../../src/core/connector";
import { MappingUtil } from "../../src/utils/mapping-util";
import ApiResponseListCustomers from "../_data/api__list_customers.json";
import ApiResponseListInvoices from "../_data/api__list_invoices.json";
import ApiResponseListSubscriptions from "../_data/api__list_subscriptions.json";
import { DateTime } from "luxon";
import { set, unset, cloneDeep, sum } from "lodash";
import { ReferralUrl, Contact, Note, Discount, Tax, Addon, EventBasedAddon, ChargedEventBasedAddon, Coupon } from "../../src/core/service-objects";
import IHullUserEvent from "../../src/types/user-event";
import { IHullAccountAttributes } from "../../src/types/account";

describe("MappingUtil", () => {
  const loggerMock = {
    info: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  };

  describe("#constructor()", () => {
    it("should initialize readonly variables", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "none"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      expect(util.privateSettings).toEqual(privateSettings);
      expect(util.logger).toBeDefined();
    });
  });

  describe("#mapCustomerToIdentityUser()", () => {
    it("should map Customer with external_id to Hull User Claims", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = ApiResponseListCustomers.list[0];
      const expected = {
        external_id: data.customer.id,
        anonymous_id: `chargebee:${data.customer.id}`
      };
      const actual = util.mapCustomerToIdentityUser(data.customer);
      expect(actual).toEqual(expected);

    });

    it("should map Customer with email to Hull User Claims", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "email"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = ApiResponseListCustomers.list[0];
      const expected = {
        email: data.customer.email,
        anonymous_id: `chargebee:${data.customer.id}`
      };
      const actual = util.mapCustomerToIdentityUser(data.customer);
      expect(actual).toEqual(expected);

    });

    it("should map Customer with default to Hull User Claims", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "none"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = ApiResponseListCustomers.list[0];
      const expected = {
        anonymous_id: `chargebee:${data.customer.id}`
      };
      const actual = util.mapCustomerToIdentityUser(data.customer);
      expect(actual).toEqual(expected);

    });
  });

  describe("#mapCustomerToIdentityAccount()", () => {
    it("should map Customer with external_id to Hull Account Claims", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "external_id",
        incoming_resolution_user: "none"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = ApiResponseListCustomers.list[0];
      const expected = {
        external_id: data.customer.id,
        anonymous_id: `chargebee:${data.customer.id}`
      };
      const actual = util.mapCustomerToIdentityAccount(data.customer);
      expect(actual).toEqual(expected);

    });

    it("should map Customer with default to Hull Account Claims", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "none"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = ApiResponseListCustomers.list[0];
      const expected = {
        anonymous_id: `chargebee:${data.customer.id}`
      };
      const actual = util.mapCustomerToIdentityAccount(data.customer);
      expect(actual).toEqual(expected);

    });
  });

  describe("#mapCustomerToAttributesUser()", () => {
    it("should map all customer fields to Hull User Attributes", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListCustomers.list[0]);
      const expected = {
        "chargebee/allow_direct_debit": data.customer.allow_direct_debit,
        "chargebee/auto_collection": data.customer.auto_collection,
        "chargebee/card_status": data.customer.card_status,
        "chargebee/created_at": DateTime.fromSeconds(data.customer.created_at).toISO(),
        "chargebee/deleted": data.customer.deleted,
        "chargebee/email": data.customer.email,
        "chargebee/excess_payments": data.customer.excess_payments,
        "chargebee/first_name": data.customer.first_name,
        "chargebee/id": data.customer.id,
        "chargebee/last_name": data.customer.last_name,
        "chargebee/net_term_days": data.customer.net_term_days,
        "chargebee/object": data.customer.object,
        "chargebee/pii_cleared": data.customer.pii_cleared,
        "chargebee/preferred_currency_code": data.customer.preferred_currency_code,
        "chargebee/promotional_credits": data.customer.promotional_credits,
        "chargebee/refundable_credits": data.customer.refundable_credits,
        "chargebee/resource_version": data.customer.resource_version,
        "chargebee/taxability": data.customer.taxability,
        "chargebee/unbilled_charges": data.customer.unbilled_charges,
        "chargebee/updated_at": DateTime.fromSeconds(data.customer.updated_at).toISO(),
        "first_name": { value: data.customer.first_name, operation: "setIfNull" },
        "last_name": { value: data.customer.last_name, operation: "setIfNull" },
      };

      const actual = util.mapCustomerToAttributesUser(data.customer);
      expect(actual).toEqual(expected);
    });

    it("should map all customer fields inlcuding meta_data to Hull User Attributes", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListCustomers.list[0]);
      set(data, "customer.meta_data", { "foo": "bar", "bazInga": true })
      const expected = {
        "chargebee/allow_direct_debit": data.customer.allow_direct_debit,
        "chargebee/auto_collection": data.customer.auto_collection,
        "chargebee/card_status": data.customer.card_status,
        "chargebee/created_at": DateTime.fromSeconds(data.customer.created_at).toISO(),
        "chargebee/deleted": data.customer.deleted,
        "chargebee/email": data.customer.email,
        "chargebee/excess_payments": data.customer.excess_payments,
        "chargebee/first_name": data.customer.first_name,
        "chargebee/id": data.customer.id,
        "chargebee/last_name": data.customer.last_name,
        "chargebee/meta_data_foo": "bar",
        "chargebee/meta_data_baz_inga": true,
        "chargebee/net_term_days": data.customer.net_term_days,
        "chargebee/object": data.customer.object,
        "chargebee/pii_cleared": data.customer.pii_cleared,
        "chargebee/preferred_currency_code": data.customer.preferred_currency_code,
        "chargebee/promotional_credits": data.customer.promotional_credits,
        "chargebee/refundable_credits": data.customer.refundable_credits,
        "chargebee/resource_version": data.customer.resource_version,
        "chargebee/taxability": data.customer.taxability,
        "chargebee/unbilled_charges": data.customer.unbilled_charges,
        "chargebee/updated_at": DateTime.fromSeconds(data.customer.updated_at).toISO(),
        "first_name": { value: data.customer.first_name, operation: "setIfNull" },
        "last_name": { value: data.customer.last_name, operation: "setIfNull" },
      };

      const actual = util.mapCustomerToAttributesUser(data.customer);
      expect(actual).toEqual(expected);
    });

    it("should map all customer fields inlcuding referral_urls to Hull User Attributes", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListCustomers.list[0]);
      const referralUrls: Array<ReferralUrl> = [
        {
          created_at: DateTime.utc().toSeconds(),
          referral_account_id: "__test__128tb",
          referral_campaign_id: "test",
          referral_sharing_url: "https://example.com?a=__test__128tb&c=test",
          referral_system: "website",
          updated_at: DateTime.utc().toSeconds(),
        }
      ];
      set(data, "customer.referral_urls", referralUrls)
      const expected = {
        "chargebee/allow_direct_debit": data.customer.allow_direct_debit,
        "chargebee/auto_collection": data.customer.auto_collection,
        "chargebee/card_status": data.customer.card_status,
        "chargebee/created_at": DateTime.fromSeconds(data.customer.created_at).toISO(),
        "chargebee/deleted": data.customer.deleted,
        "chargebee/email": data.customer.email,
        "chargebee/excess_payments": data.customer.excess_payments,
        "chargebee/first_name": data.customer.first_name,
        "chargebee/id": data.customer.id,
        "chargebee/last_name": data.customer.last_name,
        "chargebee/net_term_days": data.customer.net_term_days,
        "chargebee/object": data.customer.object,
        "chargebee/pii_cleared": data.customer.pii_cleared,
        "chargebee/preferred_currency_code": data.customer.preferred_currency_code,
        "chargebee/promotional_credits": data.customer.promotional_credits,
        "chargebee/referral_urls": referralUrls.map((ru) => ru.referral_sharing_url),
        "chargebee/refundable_credits": data.customer.refundable_credits,
        "chargebee/resource_version": data.customer.resource_version,
        "chargebee/taxability": data.customer.taxability,
        "chargebee/unbilled_charges": data.customer.unbilled_charges,
        "chargebee/updated_at": DateTime.fromSeconds(data.customer.updated_at).toISO(),
        "first_name": { value: data.customer.first_name, operation: "setIfNull" },
        "last_name": { value: data.customer.last_name, operation: "setIfNull" },
      };

      const actual = util.mapCustomerToAttributesUser(data.customer);
      expect(actual).toEqual(expected);
    });

    it("should map all customer fields inlcuding null referral_urls to Hull User Attributes", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListCustomers.list[0]);
      const referralUrls = null;
      set(data, "customer.referral_urls", referralUrls)
      const expected = {
        "chargebee/allow_direct_debit": data.customer.allow_direct_debit,
        "chargebee/auto_collection": data.customer.auto_collection,
        "chargebee/card_status": data.customer.card_status,
        "chargebee/created_at": DateTime.fromSeconds(data.customer.created_at).toISO(),
        "chargebee/deleted": data.customer.deleted,
        "chargebee/email": data.customer.email,
        "chargebee/excess_payments": data.customer.excess_payments,
        "chargebee/first_name": data.customer.first_name,
        "chargebee/id": data.customer.id,
        "chargebee/last_name": data.customer.last_name,
        "chargebee/net_term_days": data.customer.net_term_days,
        "chargebee/object": data.customer.object,
        "chargebee/pii_cleared": data.customer.pii_cleared,
        "chargebee/preferred_currency_code": data.customer.preferred_currency_code,
        "chargebee/promotional_credits": data.customer.promotional_credits,
        "chargebee/referral_urls": [],
        "chargebee/refundable_credits": data.customer.refundable_credits,
        "chargebee/resource_version": data.customer.resource_version,
        "chargebee/taxability": data.customer.taxability,
        "chargebee/unbilled_charges": data.customer.unbilled_charges,
        "chargebee/updated_at": DateTime.fromSeconds(data.customer.updated_at).toISO(),
        "first_name": { value: data.customer.first_name, operation: "setIfNull" },
        "last_name": { value: data.customer.last_name, operation: "setIfNull" },
      };

      const actual = util.mapCustomerToAttributesUser(data.customer);
      expect(actual).toEqual(expected);
    });

    it("should map all customer fields inlcuding contacts to Hull User Attributes", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListCustomers.list[0]);
      const contacts: Array<Contact> = [{
        email: "admin@example.com",
        enabled: true,
        id: "__test_y93hgnhyoi",
        send_account_email: true,
        send_billing_email: true,
        first_name: "Admin",
        label: "admin",
      }];
      set(data, "customer.contacts", contacts)
      const expected = {
        "chargebee/allow_direct_debit": data.customer.allow_direct_debit,
        "chargebee/auto_collection": data.customer.auto_collection,
        "chargebee/card_status": data.customer.card_status,
        "chargebee/contacts_emails": contacts.map((c) => c.email),
        "chargebee/created_at": DateTime.fromSeconds(data.customer.created_at).toISO(),
        "chargebee/deleted": data.customer.deleted,
        "chargebee/email": data.customer.email,
        "chargebee/excess_payments": data.customer.excess_payments,
        "chargebee/first_name": data.customer.first_name,
        "chargebee/id": data.customer.id,
        "chargebee/last_name": data.customer.last_name,
        "chargebee/net_term_days": data.customer.net_term_days,
        "chargebee/object": data.customer.object,
        "chargebee/pii_cleared": data.customer.pii_cleared,
        "chargebee/preferred_currency_code": data.customer.preferred_currency_code,
        "chargebee/promotional_credits": data.customer.promotional_credits,
        "chargebee/refundable_credits": data.customer.refundable_credits,
        "chargebee/resource_version": data.customer.resource_version,
        "chargebee/taxability": data.customer.taxability,
        "chargebee/unbilled_charges": data.customer.unbilled_charges,
        "chargebee/updated_at": DateTime.fromSeconds(data.customer.updated_at).toISO(),
        "first_name": { value: data.customer.first_name, operation: "setIfNull" },
        "last_name": { value: data.customer.last_name, operation: "setIfNull" },
      };

      const actual = util.mapCustomerToAttributesUser(data.customer);
      expect(actual).toEqual(expected);
    });

    it("should map all customer fields inlcuding null contacts to Hull User Attributes", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListCustomers.list[0]);
      const contacts = null;
      set(data, "customer.contacts", contacts)
      const expected = {
        "chargebee/allow_direct_debit": data.customer.allow_direct_debit,
        "chargebee/auto_collection": data.customer.auto_collection,
        "chargebee/card_status": data.customer.card_status,
        "chargebee/contacts_emails": [],
        "chargebee/created_at": DateTime.fromSeconds(data.customer.created_at).toISO(),
        "chargebee/deleted": data.customer.deleted,
        "chargebee/email": data.customer.email,
        "chargebee/excess_payments": data.customer.excess_payments,
        "chargebee/first_name": data.customer.first_name,
        "chargebee/id": data.customer.id,
        "chargebee/last_name": data.customer.last_name,
        "chargebee/net_term_days": data.customer.net_term_days,
        "chargebee/object": data.customer.object,
        "chargebee/pii_cleared": data.customer.pii_cleared,
        "chargebee/preferred_currency_code": data.customer.preferred_currency_code,
        "chargebee/promotional_credits": data.customer.promotional_credits,
        "chargebee/refundable_credits": data.customer.refundable_credits,
        "chargebee/resource_version": data.customer.resource_version,
        "chargebee/taxability": data.customer.taxability,
        "chargebee/unbilled_charges": data.customer.unbilled_charges,
        "chargebee/updated_at": DateTime.fromSeconds(data.customer.updated_at).toISO(),
        "first_name": { value: data.customer.first_name, operation: "setIfNull" },
        "last_name": { value: data.customer.last_name, operation: "setIfNull" },
      };

      const actual = util.mapCustomerToAttributesUser(data.customer);
      expect(actual).toEqual(expected);
    });

    it("should map all customer fields to Hull User Attributes and not map TLAs if not present", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListCustomers.list[0]);
      unset(data, "customer.first_name");
      unset(data, "customer.last_name");

      const expected = {
        "chargebee/allow_direct_debit": data.customer.allow_direct_debit,
        "chargebee/auto_collection": data.customer.auto_collection,
        "chargebee/card_status": data.customer.card_status,
        "chargebee/created_at": DateTime.fromSeconds(data.customer.created_at).toISO(),
        "chargebee/deleted": data.customer.deleted,
        "chargebee/email": data.customer.email,
        "chargebee/excess_payments": data.customer.excess_payments,
        "chargebee/id": data.customer.id,
        "chargebee/net_term_days": data.customer.net_term_days,
        "chargebee/object": data.customer.object,
        "chargebee/pii_cleared": data.customer.pii_cleared,
        "chargebee/preferred_currency_code": data.customer.preferred_currency_code,
        "chargebee/promotional_credits": data.customer.promotional_credits,
        "chargebee/refundable_credits": data.customer.refundable_credits,
        "chargebee/resource_version": data.customer.resource_version,
        "chargebee/taxability": data.customer.taxability,
        "chargebee/unbilled_charges": data.customer.unbilled_charges,
        "chargebee/updated_at": DateTime.fromSeconds(data.customer.updated_at).toISO(),
      };

      const actual = util.mapCustomerToAttributesUser(data.customer);
      expect(actual).toEqual(expected);
    });
  });

  describe("#mapCustomerToAttributesAccount()", () => {
    it("should map all customer fields to Hull Account Attributes", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListCustomers.list[0]);
      const expected = {
        "chargebee/allow_direct_debit": data.customer.allow_direct_debit,
        "chargebee/auto_collection": data.customer.auto_collection,
        "chargebee/card_status": data.customer.card_status,
        "chargebee/created_at": DateTime.fromSeconds(data.customer.created_at).toISO(),
        "chargebee/deleted": data.customer.deleted,
        "chargebee/email": data.customer.email,
        "chargebee/excess_payments": data.customer.excess_payments,
        "chargebee/first_name": data.customer.first_name,
        "chargebee/id": data.customer.id,
        "chargebee/last_name": data.customer.last_name,
        "chargebee/net_term_days": data.customer.net_term_days,
        "chargebee/object": data.customer.object,
        "chargebee/pii_cleared": data.customer.pii_cleared,
        "chargebee/preferred_currency_code": data.customer.preferred_currency_code,
        "chargebee/promotional_credits": data.customer.promotional_credits,
        "chargebee/refundable_credits": data.customer.refundable_credits,
        "chargebee/resource_version": data.customer.resource_version,
        "chargebee/taxability": data.customer.taxability,
        "chargebee/unbilled_charges": data.customer.unbilled_charges,
        "chargebee/updated_at": DateTime.fromSeconds(data.customer.updated_at).toISO(),
      };

      const actual = util.mapCustomerToAttributesAccount(data.customer);
      expect(actual).toEqual(expected);
    });

    it("should map all customer fields inlcuding meta_data to Hull Account Attributes", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListCustomers.list[0]);
      set(data, "customer.meta_data", { "foo": "bar", "bazInga": true })
      const expected = {
        "chargebee/allow_direct_debit": data.customer.allow_direct_debit,
        "chargebee/auto_collection": data.customer.auto_collection,
        "chargebee/card_status": data.customer.card_status,
        "chargebee/created_at": DateTime.fromSeconds(data.customer.created_at).toISO(),
        "chargebee/deleted": data.customer.deleted,
        "chargebee/email": data.customer.email,
        "chargebee/excess_payments": data.customer.excess_payments,
        "chargebee/first_name": data.customer.first_name,
        "chargebee/id": data.customer.id,
        "chargebee/last_name": data.customer.last_name,
        "chargebee/meta_data_foo": "bar",
        "chargebee/meta_data_baz_inga": true,
        "chargebee/net_term_days": data.customer.net_term_days,
        "chargebee/object": data.customer.object,
        "chargebee/pii_cleared": data.customer.pii_cleared,
        "chargebee/preferred_currency_code": data.customer.preferred_currency_code,
        "chargebee/promotional_credits": data.customer.promotional_credits,
        "chargebee/refundable_credits": data.customer.refundable_credits,
        "chargebee/resource_version": data.customer.resource_version,
        "chargebee/taxability": data.customer.taxability,
        "chargebee/unbilled_charges": data.customer.unbilled_charges,
        "chargebee/updated_at": DateTime.fromSeconds(data.customer.updated_at).toISO(),
      };

      const actual = util.mapCustomerToAttributesAccount(data.customer);
      expect(actual).toEqual(expected);
    });

    it("should map all customer fields inlcuding referral_urls to Hull Account Attributes", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListCustomers.list[0]);
      const referralUrls: Array<ReferralUrl> = [
        {
          created_at: DateTime.utc().toSeconds(),
          referral_account_id: "__test__128tb",
          referral_campaign_id: "test",
          referral_sharing_url: "https://example.com?a=__test__128tb&c=test",
          referral_system: "website",
          updated_at: DateTime.utc().toSeconds(),
        }
      ];
      set(data, "customer.referral_urls", referralUrls)
      const expected = {
        "chargebee/allow_direct_debit": data.customer.allow_direct_debit,
        "chargebee/auto_collection": data.customer.auto_collection,
        "chargebee/card_status": data.customer.card_status,
        "chargebee/created_at": DateTime.fromSeconds(data.customer.created_at).toISO(),
        "chargebee/deleted": data.customer.deleted,
        "chargebee/email": data.customer.email,
        "chargebee/excess_payments": data.customer.excess_payments,
        "chargebee/first_name": data.customer.first_name,
        "chargebee/id": data.customer.id,
        "chargebee/last_name": data.customer.last_name,
        "chargebee/net_term_days": data.customer.net_term_days,
        "chargebee/object": data.customer.object,
        "chargebee/pii_cleared": data.customer.pii_cleared,
        "chargebee/preferred_currency_code": data.customer.preferred_currency_code,
        "chargebee/promotional_credits": data.customer.promotional_credits,
        "chargebee/referral_urls": referralUrls.map((ru) => ru.referral_sharing_url),
        "chargebee/refundable_credits": data.customer.refundable_credits,
        "chargebee/resource_version": data.customer.resource_version,
        "chargebee/taxability": data.customer.taxability,
        "chargebee/unbilled_charges": data.customer.unbilled_charges,
        "chargebee/updated_at": DateTime.fromSeconds(data.customer.updated_at).toISO(),
      };

      const actual = util.mapCustomerToAttributesAccount(data.customer);
      expect(actual).toEqual(expected);
    });

    it("should map all customer fields inlcuding null referral_urls to Hull Account Attributes", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListCustomers.list[0]);
      const referralUrls = null;
      set(data, "customer.referral_urls", referralUrls)
      const expected = {
        "chargebee/allow_direct_debit": data.customer.allow_direct_debit,
        "chargebee/auto_collection": data.customer.auto_collection,
        "chargebee/card_status": data.customer.card_status,
        "chargebee/created_at": DateTime.fromSeconds(data.customer.created_at).toISO(),
        "chargebee/deleted": data.customer.deleted,
        "chargebee/email": data.customer.email,
        "chargebee/excess_payments": data.customer.excess_payments,
        "chargebee/first_name": data.customer.first_name,
        "chargebee/id": data.customer.id,
        "chargebee/last_name": data.customer.last_name,
        "chargebee/net_term_days": data.customer.net_term_days,
        "chargebee/object": data.customer.object,
        "chargebee/pii_cleared": data.customer.pii_cleared,
        "chargebee/preferred_currency_code": data.customer.preferred_currency_code,
        "chargebee/promotional_credits": data.customer.promotional_credits,
        "chargebee/referral_urls": [],
        "chargebee/refundable_credits": data.customer.refundable_credits,
        "chargebee/resource_version": data.customer.resource_version,
        "chargebee/taxability": data.customer.taxability,
        "chargebee/unbilled_charges": data.customer.unbilled_charges,
        "chargebee/updated_at": DateTime.fromSeconds(data.customer.updated_at).toISO(),
      };

      const actual = util.mapCustomerToAttributesAccount(data.customer);
      expect(actual).toEqual(expected);
    });

    it("should map all customer fields inlcuding contacts to Hull Account Attributes", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListCustomers.list[0]);
      const contacts: Array<Contact> = [{
        email: "admin@example.com",
        enabled: true,
        id: "__test_y93hgnhyoi",
        send_account_email: true,
        send_billing_email: true,
        first_name: "Admin",
        label: "admin",
      }];
      set(data, "customer.contacts", contacts)
      const expected = {
        "chargebee/allow_direct_debit": data.customer.allow_direct_debit,
        "chargebee/auto_collection": data.customer.auto_collection,
        "chargebee/card_status": data.customer.card_status,
        "chargebee/contacts_emails": contacts.map((c) => c.email),
        "chargebee/created_at": DateTime.fromSeconds(data.customer.created_at).toISO(),
        "chargebee/deleted": data.customer.deleted,
        "chargebee/email": data.customer.email,
        "chargebee/excess_payments": data.customer.excess_payments,
        "chargebee/first_name": data.customer.first_name,
        "chargebee/id": data.customer.id,
        "chargebee/last_name": data.customer.last_name,
        "chargebee/net_term_days": data.customer.net_term_days,
        "chargebee/object": data.customer.object,
        "chargebee/pii_cleared": data.customer.pii_cleared,
        "chargebee/preferred_currency_code": data.customer.preferred_currency_code,
        "chargebee/promotional_credits": data.customer.promotional_credits,
        "chargebee/refundable_credits": data.customer.refundable_credits,
        "chargebee/resource_version": data.customer.resource_version,
        "chargebee/taxability": data.customer.taxability,
        "chargebee/unbilled_charges": data.customer.unbilled_charges,
        "chargebee/updated_at": DateTime.fromSeconds(data.customer.updated_at).toISO(),
      };

      const actual = util.mapCustomerToAttributesAccount(data.customer);
      expect(actual).toEqual(expected);
    });

    it("should map all customer fields inlcuding null contacts to Hull Account Attributes", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListCustomers.list[0]);
      const contacts = null;
      set(data, "customer.contacts", contacts)
      const expected = {
        "chargebee/allow_direct_debit": data.customer.allow_direct_debit,
        "chargebee/auto_collection": data.customer.auto_collection,
        "chargebee/card_status": data.customer.card_status,
        "chargebee/contacts_emails": [],
        "chargebee/created_at": DateTime.fromSeconds(data.customer.created_at).toISO(),
        "chargebee/deleted": data.customer.deleted,
        "chargebee/email": data.customer.email,
        "chargebee/excess_payments": data.customer.excess_payments,
        "chargebee/first_name": data.customer.first_name,
        "chargebee/id": data.customer.id,
        "chargebee/last_name": data.customer.last_name,
        "chargebee/net_term_days": data.customer.net_term_days,
        "chargebee/object": data.customer.object,
        "chargebee/pii_cleared": data.customer.pii_cleared,
        "chargebee/preferred_currency_code": data.customer.preferred_currency_code,
        "chargebee/promotional_credits": data.customer.promotional_credits,
        "chargebee/refundable_credits": data.customer.refundable_credits,
        "chargebee/resource_version": data.customer.resource_version,
        "chargebee/taxability": data.customer.taxability,
        "chargebee/unbilled_charges": data.customer.unbilled_charges,
        "chargebee/updated_at": DateTime.fromSeconds(data.customer.updated_at).toISO(),
      };

      const actual = util.mapCustomerToAttributesAccount(data.customer);
      expect(actual).toEqual(expected);
    });

    it("should map all customer fields to Hull Account Attributes and map TLA if present", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListCustomers.list[0]);
      set(data, "customer.company", "Demo Inc.");
      unset(data, "customer.first_name");
      unset(data, "customer.last_name");

      const expected = {
        "chargebee/allow_direct_debit": data.customer.allow_direct_debit,
        "chargebee/auto_collection": data.customer.auto_collection,
        "chargebee/card_status": data.customer.card_status,
        "chargebee/company":"Demo Inc.",
        "chargebee/created_at": DateTime.fromSeconds(data.customer.created_at).toISO(),
        "chargebee/deleted": data.customer.deleted,
        "chargebee/email": data.customer.email,
        "chargebee/excess_payments": data.customer.excess_payments,
        "chargebee/id": data.customer.id,
        "chargebee/net_term_days": data.customer.net_term_days,
        "chargebee/object": data.customer.object,
        "chargebee/pii_cleared": data.customer.pii_cleared,
        "chargebee/preferred_currency_code": data.customer.preferred_currency_code,
        "chargebee/promotional_credits": data.customer.promotional_credits,
        "chargebee/refundable_credits": data.customer.refundable_credits,
        "chargebee/resource_version": data.customer.resource_version,
        "chargebee/taxability": data.customer.taxability,
        "chargebee/unbilled_charges": data.customer.unbilled_charges,
        "chargebee/updated_at": DateTime.fromSeconds(data.customer.updated_at).toISO(),
        "name": { value: "Demo Inc.", operation: "setIfNull"}
      };

      const actual = util.mapCustomerToAttributesAccount(data.customer);
      expect(actual).toEqual(expected);
    });
  });

  describe("#mapInvoiceToUserEvent()", () => {
    it("should map an Invoice to a Hull User Event", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListInvoices.list[0]);

      const expected: IHullUserEvent = {
        event: "Invoice updated",
        created_at: DateTime.fromSeconds(data.invoice.updated_at as number).toISO() as string,
        event_id: `${data.invoice.id}-${data.invoice.resource_version}`,
        context: {
          created_at: DateTime.fromSeconds(data.invoice.updated_at as number).toISO() as string,
          event_id: `${data.invoice.id}-${data.invoice.resource_version}`,
          ip: 0,
          source: "chargebee"
        },
        properties: {
          "amount_adjusted": data.invoice.amount_adjusted,
          "amount_due": data.invoice.amount_due,
          "amount_paid": data.invoice.amount_paid,
          "amount_to_collect": data.invoice.amount_to_collect,
          "base_currency_code": data.invoice.base_currency_code,
          "billing_address": data.invoice.billing_address,
          "credits_applied": data.invoice.credits_applied,
          "currency_code": data.invoice.currency_code,
          "customer_id": data.invoice.customer_id,
          "invoice_date": DateTime.fromSeconds(data.invoice.date).toISO(),
          "deleted": data.invoice.deleted,
          "due_date": DateTime.fromSeconds(data.invoice.due_date).toISO(),
          "exchange_rate": data.invoice.exchange_rate,
          "first_invoice": data.invoice.first_invoice,
          "has_advance_charges": data.invoice.has_advance_charges,
          "id": data.invoice.id,
          "is_gifted": data.invoice.is_gifted,
          "line_items_ids": data.invoice.line_items.map(li => li.id).join(", "),
          "line_items_quantities": data.invoice.line_items.map(li => li.quantity).join(", "),
          "line_items_amounts": data.invoice.line_items.map(li => li.amount).join(", "),
          "line_items_descriptions": data.invoice.line_items.map(li => li.description).join(", "),
          "linked_orders_ids": [],
          "net_term_days": data.invoice.net_term_days,
          "new_sales_amount": data.invoice.new_sales_amount,
          "object": data.invoice.object,
          "paid_at": DateTime.fromSeconds(data.invoice.paid_at).toISO(),
          "price_type": data.invoice.price_type,
          "recurring": data.invoice.recurring,
          "resource_version": data.invoice.resource_version,
          "round_off_amount": data.invoice.round_off_amount,
          "status": data.invoice.status,
          "sub_total": data.invoice.sub_total,
          "tax": data.invoice.tax,
          "term_finalized": data.invoice.term_finalized,
          "total": data.invoice.total,
          "updated_at": DateTime.fromSeconds(data.invoice.updated_at).toISO(),
          "write_off_amount": data.invoice.write_off_amount
        }
      };

      const actual = util.mapInvoiceToUserEvent(data.invoice);
      expect(actual).toEqual(expected);
    });

    it("should map an Invoice including notes to a Hull User Event", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListInvoices.list[0]);

      const notes: Array<Note> = [
        {
          entity_type: "note",
          note: "Some test.",
        }
      ];
      set(data, "invoice.notes", notes);

      const expected: IHullUserEvent = {
        event: "Invoice updated",
        created_at: DateTime.fromSeconds(data.invoice.updated_at as number).toISO() as string,
        event_id: `${data.invoice.id}-${data.invoice.resource_version}`,
        context: {
          created_at: DateTime.fromSeconds(data.invoice.updated_at as number).toISO() as string,
          event_id: `${data.invoice.id}-${data.invoice.resource_version}`,
          ip: 0,
          source: "chargebee"
        },
        properties: {
          "amount_adjusted": data.invoice.amount_adjusted,
          "amount_due": data.invoice.amount_due,
          "amount_paid": data.invoice.amount_paid,
          "amount_to_collect": data.invoice.amount_to_collect,
          "base_currency_code": data.invoice.base_currency_code,
          "billing_address": data.invoice.billing_address,
          "credits_applied": data.invoice.credits_applied,
          "currency_code": data.invoice.currency_code,
          "customer_id": data.invoice.customer_id,
          "invoice_date": DateTime.fromSeconds(data.invoice.date).toISO(),
          "deleted": data.invoice.deleted,
          "due_date": DateTime.fromSeconds(data.invoice.due_date).toISO(),
          "exchange_rate": data.invoice.exchange_rate,
          "first_invoice": data.invoice.first_invoice,
          "has_advance_charges": data.invoice.has_advance_charges,
          "id": data.invoice.id,
          "is_gifted": data.invoice.is_gifted,
          "line_items_ids": data.invoice.line_items.map(li => li.id).join(", "),
          "line_items_quantities": data.invoice.line_items.map(li => li.quantity).join(", "),
          "line_items_amounts": data.invoice.line_items.map(li => li.amount).join(", "),
          "line_items_descriptions": data.invoice.line_items.map(li => li.description).join(", "),
          "linked_orders_ids": [],
          "net_term_days": data.invoice.net_term_days,
          "new_sales_amount": data.invoice.new_sales_amount,
          "notes": notes.map(n => n.note).join(" "),
          "object": data.invoice.object,
          "paid_at": DateTime.fromSeconds(data.invoice.paid_at).toISO(),
          "price_type": data.invoice.price_type,
          "recurring": data.invoice.recurring,
          "resource_version": data.invoice.resource_version,
          "round_off_amount": data.invoice.round_off_amount,
          "status": data.invoice.status,
          "sub_total": data.invoice.sub_total,
          "tax": data.invoice.tax,
          "term_finalized": data.invoice.term_finalized,
          "total": data.invoice.total,
          "updated_at": DateTime.fromSeconds(data.invoice.updated_at).toISO(),
          "write_off_amount": data.invoice.write_off_amount
        }
      };

      const actual = util.mapInvoiceToUserEvent(data.invoice);
      expect(actual).toEqual(expected);
    });

    it("should map an Invoice with null arrays to a Hull User Event", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListInvoices.list[0]);
      set(data, "invoice.line_items", null);
      set(data, "invoice.linked_orders", null);
      set(data, "invoice.notes", null);

      const expected: IHullUserEvent = {
        event: "Invoice updated",
        created_at: DateTime.fromSeconds(data.invoice.updated_at as number).toISO() as string,
        event_id: `${data.invoice.id}-${data.invoice.resource_version}`,
        context: {
          created_at: DateTime.fromSeconds(data.invoice.updated_at as number).toISO() as string,
          event_id: `${data.invoice.id}-${data.invoice.resource_version}`,
          ip: 0,
          source: "chargebee"
        },
        properties: {
          "amount_adjusted": data.invoice.amount_adjusted,
          "amount_due": data.invoice.amount_due,
          "amount_paid": data.invoice.amount_paid,
          "amount_to_collect": data.invoice.amount_to_collect,
          "base_currency_code": data.invoice.base_currency_code,
          "billing_address": data.invoice.billing_address,
          "credits_applied": data.invoice.credits_applied,
          "currency_code": data.invoice.currency_code,
          "customer_id": data.invoice.customer_id,
          "invoice_date": DateTime.fromSeconds(data.invoice.date).toISO(),
          "deleted": data.invoice.deleted,
          "due_date": DateTime.fromSeconds(data.invoice.due_date).toISO(),
          "exchange_rate": data.invoice.exchange_rate,
          "first_invoice": data.invoice.first_invoice,
          "has_advance_charges": data.invoice.has_advance_charges,
          "id": data.invoice.id,
          "is_gifted": data.invoice.is_gifted,
          "line_items_ids": null,
          "line_items_quantities": null,
          "line_items_amounts": null,
          "line_items_descriptions": null,
          "linked_orders_ids": null,
          "net_term_days": data.invoice.net_term_days,
          "new_sales_amount": data.invoice.new_sales_amount,
          "notes": null,
          "object": data.invoice.object,
          "paid_at": DateTime.fromSeconds(data.invoice.paid_at).toISO(),
          "price_type": data.invoice.price_type,
          "recurring": data.invoice.recurring,
          "resource_version": data.invoice.resource_version,
          "round_off_amount": data.invoice.round_off_amount,
          "status": data.invoice.status,
          "sub_total": data.invoice.sub_total,
          "tax": data.invoice.tax,
          "term_finalized": data.invoice.term_finalized,
          "total": data.invoice.total,
          "updated_at": DateTime.fromSeconds(data.invoice.updated_at).toISO(),
          "write_off_amount": data.invoice.write_off_amount
        }
      };

      const actual = util.mapInvoiceToUserEvent(data.invoice);
      expect(actual).toEqual(expected);
    });
  });

  describe("#mapInvoiceAggregationToAttributesAccount()", () => {
    it("should map the first Invoice to Hull Account Attributes", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListInvoices.list[0]);

      const expected: IHullAccountAttributes = {
        "chargebee_first_invoice/amount_adjusted": data.invoice.amount_adjusted,
        "chargebee_first_invoice/amount_due": data.invoice.amount_due,
        "chargebee_first_invoice/amount_paid": data.invoice.amount_paid,
        "chargebee_first_invoice/amount_to_collect": data.invoice.amount_to_collect,
        "chargebee_first_invoice/base_currency_code": data.invoice.base_currency_code,
        "chargebee_first_invoice/billing_address": data.invoice.billing_address,
        "chargebee_first_invoice/credits_applied": data.invoice.credits_applied,
        "chargebee_first_invoice/currency_code": data.invoice.currency_code,
        "chargebee_first_invoice/customer_id": data.invoice.customer_id,
        "chargebee_first_invoice/invoice_date": DateTime.fromSeconds(data.invoice.date).toISO(),
        "chargebee_first_invoice/deleted": data.invoice.deleted,
        "chargebee_first_invoice/due_date": DateTime.fromSeconds(data.invoice.due_date).toISO(),
        "chargebee_first_invoice/exchange_rate": data.invoice.exchange_rate,
        "chargebee_first_invoice/first_invoice": data.invoice.first_invoice,
        "chargebee_first_invoice/has_advance_charges": data.invoice.has_advance_charges,
        "chargebee_first_invoice/id": data.invoice.id,
        "chargebee_first_invoice/is_gifted": data.invoice.is_gifted,
        "chargebee_first_invoice/line_items_ids": data.invoice.line_items.map(li => li.id),
        "chargebee_first_invoice/line_items_quantities": data.invoice.line_items.map(li => li.quantity),
        "chargebee_first_invoice/line_items_amounts": data.invoice.line_items.map(li => li.amount),
        "chargebee_first_invoice/line_items_descriptions": data.invoice.line_items.map(li => li.description),
        "chargebee_first_invoice/linked_orders_ids": [],
        "chargebee_first_invoice/net_term_days": data.invoice.net_term_days,
        "chargebee_first_invoice/new_sales_amount": data.invoice.new_sales_amount,
        "chargebee_first_invoice/object": data.invoice.object,
        "chargebee_first_invoice/paid_at": DateTime.fromSeconds(data.invoice.paid_at).toISO(),
        "chargebee_first_invoice/price_type": data.invoice.price_type,
        "chargebee_first_invoice/recurring": data.invoice.recurring,
        "chargebee_first_invoice/resource_version": data.invoice.resource_version,
        "chargebee_first_invoice/round_off_amount": data.invoice.round_off_amount,
        "chargebee_first_invoice/status": data.invoice.status,
        "chargebee_first_invoice/sub_total": data.invoice.sub_total,
        "chargebee_first_invoice/tax": data.invoice.tax,
        "chargebee_first_invoice/term_finalized": data.invoice.term_finalized,
        "chargebee_first_invoice/total": data.invoice.total,
        "chargebee_first_invoice/updated_at": DateTime.fromSeconds(data.invoice.updated_at).toISO(),
        "chargebee_first_invoice/write_off_amount": data.invoice.write_off_amount

      };

      const actual = util.mapInvoiceAggregationToAttributesAccount("first", data.invoice);
      expect(actual).toEqual(expected);
    });

    it("should map the last Invoice including notes to Hull Account Attributes", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListInvoices.list[0]);

      const notes: Array<Note> = [
        {
          entity_type: "note",
          note: "Some test.",
        }
      ];
      set(data, "invoice.notes", notes);

      const expected: IHullAccountAttributes = {
        "chargebee_latest_invoice/amount_adjusted": data.invoice.amount_adjusted,
        "chargebee_latest_invoice/amount_due": data.invoice.amount_due,
        "chargebee_latest_invoice/amount_paid": data.invoice.amount_paid,
        "chargebee_latest_invoice/amount_to_collect": data.invoice.amount_to_collect,
        "chargebee_latest_invoice/base_currency_code": data.invoice.base_currency_code,
        "chargebee_latest_invoice/billing_address": data.invoice.billing_address,
        "chargebee_latest_invoice/credits_applied": data.invoice.credits_applied,
        "chargebee_latest_invoice/currency_code": data.invoice.currency_code,
        "chargebee_latest_invoice/customer_id": data.invoice.customer_id,
        "chargebee_latest_invoice/invoice_date": DateTime.fromSeconds(data.invoice.date).toISO(),
        "chargebee_latest_invoice/deleted": data.invoice.deleted,
        "chargebee_latest_invoice/due_date": DateTime.fromSeconds(data.invoice.due_date).toISO(),
        "chargebee_latest_invoice/exchange_rate": data.invoice.exchange_rate,
        "chargebee_latest_invoice/first_invoice": data.invoice.first_invoice,
        "chargebee_latest_invoice/has_advance_charges": data.invoice.has_advance_charges,
        "chargebee_latest_invoice/id": data.invoice.id,
        "chargebee_latest_invoice/is_gifted": data.invoice.is_gifted,
        "chargebee_latest_invoice/line_items_ids": data.invoice.line_items.map(li => li.id),
        "chargebee_latest_invoice/line_items_quantities": data.invoice.line_items.map(li => li.quantity),
        "chargebee_latest_invoice/line_items_amounts": data.invoice.line_items.map(li => li.amount),
        "chargebee_latest_invoice/line_items_descriptions": data.invoice.line_items.map(li => li.description),
        "chargebee_latest_invoice/linked_orders_ids": [],
        "chargebee_latest_invoice/net_term_days": data.invoice.net_term_days,
        "chargebee_latest_invoice/new_sales_amount": data.invoice.new_sales_amount,
        "chargebee_latest_invoice/notes": notes.map(n => n.note).join(" "),
        "chargebee_latest_invoice/object": data.invoice.object,
        "chargebee_latest_invoice/paid_at": DateTime.fromSeconds(data.invoice.paid_at).toISO(),
        "chargebee_latest_invoice/price_type": data.invoice.price_type,
        "chargebee_latest_invoice/recurring": data.invoice.recurring,
        "chargebee_latest_invoice/resource_version": data.invoice.resource_version,
        "chargebee_latest_invoice/round_off_amount": data.invoice.round_off_amount,
        "chargebee_latest_invoice/status": data.invoice.status,
        "chargebee_latest_invoice/sub_total": data.invoice.sub_total,
        "chargebee_latest_invoice/tax": data.invoice.tax,
        "chargebee_latest_invoice/term_finalized": data.invoice.term_finalized,
        "chargebee_latest_invoice/total": data.invoice.total,
        "chargebee_latest_invoice/updated_at": DateTime.fromSeconds(data.invoice.updated_at).toISO(),
        "chargebee_latest_invoice/write_off_amount": data.invoice.write_off_amount

      };

      const actual = util.mapInvoiceAggregationToAttributesAccount("last", data.invoice);
      expect(actual).toEqual(expected);
    });
  });

  describe("#mapSubscriptionToUserEvent", () => {
    it("should map a Subscription to a Hull User Event", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListSubscriptions.list[0]);

      const expected: IHullUserEvent = {
        event: data.subscription.created_at === data.subscription.updated_at ? "Subscription created" : "Subscription updated",
        created_at: DateTime.fromSeconds(data.subscription.updated_at as number).toISO() as string,
        event_id: `${data.subscription.id}-${data.subscription.resource_version}`,
        context: {
          created_at: DateTime.fromSeconds(data.subscription.updated_at as number).toISO() as string,
          event_id: `${data.subscription.id}-${data.subscription.resource_version}`,
          ip: 0,
          source: "chargebee"
        },
        properties: {
          "activated_at": DateTime.fromSeconds(data.subscription.activated_at).toISO(),
          "auto_collection": data.subscription.auto_collection,
          "billing_period": data.subscription.billing_period,
          "billing_period_unit": data.subscription.billing_period_unit,
          "created_at": DateTime.fromSeconds(data.subscription.created_at).toISO(),
          "currency_code": data.subscription.currency_code,
          "current_term_end_date": DateTime.fromSeconds(data.subscription.current_term_end).toISO(),
          "current_term_start_date": DateTime.fromSeconds(data.subscription.current_term_start).toISO(),
          "customer_id": data.subscription.customer_id,
          "deleted": data.subscription.deleted,
          "due_invoices_count": data.subscription.due_invoices_count,
          "due_since_date": DateTime.fromSeconds(data.subscription.due_since).toISO(),
          "has_scheduled_changes": data.subscription.has_scheduled_changes,
          "id": data.subscription.id,
          "mrr": data.subscription.mrr,
          "next_billing_at": DateTime.fromSeconds(data.subscription.next_billing_at).toISO(),
          "object": data.subscription.object,
          "plan_amount": data.subscription.plan_amount,
          "plan_free_quantity": data.subscription.plan_free_quantity,
          "plan_id": data.subscription.plan_id,
          "plan_quantity": data.subscription.plan_quantity,
          "plan_unit_price": data.subscription.plan_unit_price,
          "resource_version": data.subscription.resource_version,
          "started_at": DateTime.fromSeconds(data.subscription.started_at).toISO(),
          "status": data.subscription.status,
          "total_dues": data.subscription.total_dues,
          "updated_at": DateTime.fromSeconds(data.subscription.updated_at).toISO()
        }
      };

      const actual = util.mapSubscriptionToUserEvent(data.subscription);
      expect(actual).toEqual(expected);
    });

    it("should map a Subscription with various addons to a Hull User Event", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListSubscriptions.list[0]);
      const addons: Array<Addon> = [
        {
          id: "__test_239qhehn",
          amount: 100,
          quantity: 2,
          unit_price: 50
        }
      ];
      const eventBasedAddons: Array<EventBasedAddon> = [
        {
          charge_once: true,
          id: "__test_89023y8howns",
          on_event: "test",
          quantity: 99,
          unit_price: 0.49,
          service_period_in_days: 30
        }
      ];
      const chargedEventBasedAddons: Array<ChargedEventBasedAddon> = [
        {
          id: eventBasedAddons[0].id,
          last_charged_at: DateTime.utc().toSeconds()
        }
      ];
      set(data, "subscription.addons", addons);
      set(data, "subscription.event_based_addons", eventBasedAddons);
      set(data, "subscription.charged_event_based_addons", chargedEventBasedAddons);


      const expected: IHullUserEvent = {
        event: data.subscription.created_at === data.subscription.updated_at ? "Subscription created" : "Subscription updated",
        created_at: DateTime.fromSeconds(data.subscription.updated_at as number).toISO() as string,
        event_id: `${data.subscription.id}-${data.subscription.resource_version}`,
        context: {
          created_at: DateTime.fromSeconds(data.subscription.updated_at as number).toISO() as string,
          event_id: `${data.subscription.id}-${data.subscription.resource_version}`,
          ip: 0,
          source: "chargebee"
        },
        properties: {
          "activated_at": DateTime.fromSeconds(data.subscription.activated_at).toISO(),
          "addons_ids": addons.map(a => a.id).join(", "),
          "addons_quantities": addons.map(a => a.quantity).join(", "),
          "addons_unit_prices": addons.map(a => a.unit_price).join(", "),
          "addons_amounts": addons.map(a => a.amount).join(", "),
          "auto_collection": data.subscription.auto_collection,
          "billing_period": data.subscription.billing_period,
          "billing_period_unit": data.subscription.billing_period_unit,
          "charged_event_based_addons_ids": chargedEventBasedAddons.map(a => a.id).join(", "),
          "created_at": DateTime.fromSeconds(data.subscription.created_at).toISO(),
          "currency_code": data.subscription.currency_code,
          "current_term_end_date": DateTime.fromSeconds(data.subscription.current_term_end).toISO(),
          "current_term_start_date": DateTime.fromSeconds(data.subscription.current_term_start).toISO(),
          "customer_id": data.subscription.customer_id,
          "deleted": data.subscription.deleted,
          "due_invoices_count": data.subscription.due_invoices_count,
          "due_since_date": DateTime.fromSeconds(data.subscription.due_since).toISO(),
          "event_based_addons_ids": eventBasedAddons.map(a => a.id).join(", "),
          "event_based_addons_quantities": eventBasedAddons.map(a => a.quantity).join(", "),
          "event_based_addons_unit_prices": eventBasedAddons.map(a => a.unit_price).join(", "),
          "has_scheduled_changes": data.subscription.has_scheduled_changes,
          "id": data.subscription.id,
          "mrr": data.subscription.mrr,
          "next_billing_at": DateTime.fromSeconds(data.subscription.next_billing_at).toISO(),
          "object": data.subscription.object,
          "plan_amount": data.subscription.plan_amount,
          "plan_free_quantity": data.subscription.plan_free_quantity,
          "plan_id": data.subscription.plan_id,
          "plan_quantity": data.subscription.plan_quantity,
          "plan_unit_price": data.subscription.plan_unit_price,
          "resource_version": data.subscription.resource_version,
          "started_at": DateTime.fromSeconds(data.subscription.started_at).toISO(),
          "status": data.subscription.status,
          "total_dues": data.subscription.total_dues,
          "updated_at": DateTime.fromSeconds(data.subscription.updated_at).toISO()
        }
      };

      const actual = util.mapSubscriptionToUserEvent(data.subscription);
      expect(actual).toEqual(expected);
    });

    it("should map a Subscription with coupons to a Hull User Event", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListSubscriptions.list[0]);
      const coupons: Array<Coupon> = [
        {
          applied_count: 1,
          coupon_id: "__test_80124tyjwpmk",
          coupon_code: "TEST1"
        }
      ];
      set(data, "subscription.coupons", coupons);

      const expected: IHullUserEvent = {
        event: data.subscription.created_at === data.subscription.updated_at ? "Subscription created" : "Subscription updated",
        created_at: DateTime.fromSeconds(data.subscription.updated_at as number).toISO() as string,
        event_id: `${data.subscription.id}-${data.subscription.resource_version}`,
        context: {
          created_at: DateTime.fromSeconds(data.subscription.updated_at as number).toISO() as string,
          event_id: `${data.subscription.id}-${data.subscription.resource_version}`,
          ip: 0,
          source: "chargebee"
        },
        properties: {
          "activated_at": DateTime.fromSeconds(data.subscription.activated_at).toISO(),
          "auto_collection": data.subscription.auto_collection,
          "billing_period": data.subscription.billing_period,
          "billing_period_unit": data.subscription.billing_period_unit,
          "coupons_ids": coupons.map(c => c.coupon_id).join(", "),
          "coupons_codes": coupons.map(c => c.coupon_code).join(", "),
          "created_at": DateTime.fromSeconds(data.subscription.created_at).toISO(),
          "currency_code": data.subscription.currency_code,
          "current_term_end_date": DateTime.fromSeconds(data.subscription.current_term_end).toISO(),
          "current_term_start_date": DateTime.fromSeconds(data.subscription.current_term_start).toISO(),
          "customer_id": data.subscription.customer_id,
          "deleted": data.subscription.deleted,
          "due_invoices_count": data.subscription.due_invoices_count,
          "due_since_date": DateTime.fromSeconds(data.subscription.due_since).toISO(),
          "has_scheduled_changes": data.subscription.has_scheduled_changes,
          "id": data.subscription.id,
          "mrr": data.subscription.mrr,
          "next_billing_at": DateTime.fromSeconds(data.subscription.next_billing_at).toISO(),
          "object": data.subscription.object,
          "plan_amount": data.subscription.plan_amount,
          "plan_free_quantity": data.subscription.plan_free_quantity,
          "plan_id": data.subscription.plan_id,
          "plan_quantity": data.subscription.plan_quantity,
          "plan_unit_price": data.subscription.plan_unit_price,
          "resource_version": data.subscription.resource_version,
          "started_at": DateTime.fromSeconds(data.subscription.started_at).toISO(),
          "status": data.subscription.status,
          "total_dues": data.subscription.total_dues,
          "updated_at": DateTime.fromSeconds(data.subscription.updated_at).toISO()
        }
      };

      const actual = util.mapSubscriptionToUserEvent(data.subscription);
      expect(actual).toEqual(expected);
    });
  });

  describe("#mapSubscriptionToAttributesAccount()", () => {
    it("should map a Subscription to a Hull Account Attributes", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: true,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListSubscriptions.list[0]);

      const expected: IHullAccountAttributes = {
        "chargebee_subscription_1/activated_at": DateTime.fromSeconds(data.subscription.activated_at).toISO(),
        "chargebee_subscription_1/auto_collection": data.subscription.auto_collection,
        "chargebee_subscription_1/billing_period": data.subscription.billing_period,
        "chargebee_subscription_1/billing_period_unit": data.subscription.billing_period_unit,
        "chargebee_subscription_1/created_at": DateTime.fromSeconds(data.subscription.created_at).toISO(),
        "chargebee_subscription_1/currency_code": data.subscription.currency_code,
        "chargebee_subscription_1/current_term_end_date": DateTime.fromSeconds(data.subscription.current_term_end).toISO(),
        "chargebee_subscription_1/current_term_start_date": DateTime.fromSeconds(data.subscription.current_term_start).toISO(),
        "chargebee_subscription_1/customer_id": data.subscription.customer_id,
        "chargebee_subscription_1/deleted": data.subscription.deleted,
        "chargebee_subscription_1/due_invoices_count": data.subscription.due_invoices_count,
        "chargebee_subscription_1/due_since_date": DateTime.fromSeconds(data.subscription.due_since).toISO(),
        "chargebee_subscription_1/has_scheduled_changes": data.subscription.has_scheduled_changes,
        "chargebee_subscription_1/id": data.subscription.id,
        "chargebee_subscription_1/mrr": data.subscription.mrr,
        "chargebee_subscription_1/next_billing_at": DateTime.fromSeconds(data.subscription.next_billing_at).toISO(),
        "chargebee_subscription_1/object": data.subscription.object,
        "chargebee_subscription_1/plan_amount": data.subscription.plan_amount,
        "chargebee_subscription_1/plan_free_quantity": data.subscription.plan_free_quantity,
        "chargebee_subscription_1/plan_id": data.subscription.plan_id,
        "chargebee_subscription_1/plan_quantity": data.subscription.plan_quantity,
        "chargebee_subscription_1/plan_unit_price": data.subscription.plan_unit_price,
        "chargebee_subscription_1/resource_version": data.subscription.resource_version,
        "chargebee_subscription_1/started_at": DateTime.fromSeconds(data.subscription.started_at).toISO(),
        "chargebee_subscription_1/status": data.subscription.status,
        "chargebee_subscription_1/total_dues": data.subscription.total_dues,
        "chargebee_subscription_1/updated_at": DateTime.fromSeconds(data.subscription.updated_at).toISO()
      };

      const actual = util.mapSubscriptionToAttributesAccount(1, data.subscription);
      expect(actual).toEqual(expected);
    });

    it("should map a Subscription with various addons to a Hull Account Attributes", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListSubscriptions.list[0]);
      const addons: Array<Addon> = [
        {
          id: "__test_239qhehn",
          amount: 100,
          quantity: 2,
          unit_price: 50
        }
      ];
      const eventBasedAddons: Array<EventBasedAddon> = [
        {
          charge_once: true,
          id: "__test_89023y8howns",
          on_event: "test",
          quantity: 99,
          unit_price: 0.49,
          service_period_in_days: 30
        }
      ];
      const chargedEventBasedAddons: Array<ChargedEventBasedAddon> = [
        {
          id: eventBasedAddons[0].id,
          last_charged_at: DateTime.utc().toSeconds()
        }
      ];
      set(data, "subscription.addons", addons);
      set(data, "subscription.event_based_addons", eventBasedAddons);
      set(data, "subscription.charged_event_based_addons", chargedEventBasedAddons);


      const expected: IHullAccountAttributes = {
        "chargebee_subscription_1/activated_at": DateTime.fromSeconds(data.subscription.activated_at).toISO(),
        "chargebee_subscription_1/addons_ids": addons.map(a => a.id),
        "chargebee_subscription_1/addons_quantities": addons.map(a => a.quantity),
        "chargebee_subscription_1/addons_unit_prices": addons.map(a => a.unit_price),
        "chargebee_subscription_1/addons_amounts": addons.map(a => a.amount),
        "chargebee_subscription_1/auto_collection": data.subscription.auto_collection,
        "chargebee_subscription_1/billing_period": data.subscription.billing_period,
        "chargebee_subscription_1/billing_period_unit": data.subscription.billing_period_unit,
        "chargebee_subscription_1/charged_event_based_addons_ids": chargedEventBasedAddons.map(a => a.id),
        "chargebee_subscription_1/created_at": DateTime.fromSeconds(data.subscription.created_at).toISO(),
        "chargebee_subscription_1/currency_code": data.subscription.currency_code,
        "chargebee_subscription_1/current_term_end_date": DateTime.fromSeconds(data.subscription.current_term_end).toISO(),
        "chargebee_subscription_1/current_term_start_date": DateTime.fromSeconds(data.subscription.current_term_start).toISO(),
        "chargebee_subscription_1/customer_id": data.subscription.customer_id,
        "chargebee_subscription_1/deleted": data.subscription.deleted,
        "chargebee_subscription_1/due_invoices_count": data.subscription.due_invoices_count,
        "chargebee_subscription_1/due_since_date": DateTime.fromSeconds(data.subscription.due_since).toISO(),
        "chargebee_subscription_1/event_based_addons_ids": eventBasedAddons.map(a => a.id),
        "chargebee_subscription_1/event_based_addons_quantities": eventBasedAddons.map(a => a.quantity),
        "chargebee_subscription_1/event_based_addons_unit_prices": eventBasedAddons.map(a => a.unit_price),
        "chargebee_subscription_1/has_scheduled_changes": data.subscription.has_scheduled_changes,
        "chargebee_subscription_1/id": data.subscription.id,
        "chargebee_subscription_1/mrr": data.subscription.mrr,
        "chargebee_subscription_1/next_billing_at": DateTime.fromSeconds(data.subscription.next_billing_at).toISO(),
        "chargebee_subscription_1/object": data.subscription.object,
        "chargebee_subscription_1/plan_amount": data.subscription.plan_amount,
        "chargebee_subscription_1/plan_free_quantity": data.subscription.plan_free_quantity,
        "chargebee_subscription_1/plan_id": data.subscription.plan_id,
        "chargebee_subscription_1/plan_quantity": data.subscription.plan_quantity,
        "chargebee_subscription_1/plan_unit_price": data.subscription.plan_unit_price,
        "chargebee_subscription_1/resource_version": data.subscription.resource_version,
        "chargebee_subscription_1/started_at": DateTime.fromSeconds(data.subscription.started_at).toISO(),
        "chargebee_subscription_1/status": data.subscription.status,
        "chargebee_subscription_1/total_dues": data.subscription.total_dues,
        "chargebee_subscription_1/updated_at": DateTime.fromSeconds(data.subscription.updated_at).toISO()

      };

      const actual = util.mapSubscriptionToAttributesAccount(1, data.subscription);
      expect(actual).toEqual(expected);
    });

    it("should map a Subscription with coupons to a Hull Account Attributes", () => {
      const privateSettings: PrivateSettings = {
        aggregation_account_invoices: false,
        aggregation_account_subscriptions: false,
        incoming_resolution_account: "none",
        incoming_resolution_user: "external_id"
      };
      const options = {
        hullAppSettings: privateSettings,
        logger: loggerMock
      };

      const util = new MappingUtil(options);
      const data = cloneDeep(ApiResponseListSubscriptions.list[0]);
      const coupons: Array<Coupon> = [
        {
          applied_count: 1,
          coupon_id: "__test_80124tyjwpmk",
          coupon_code: "TEST1"
        }
      ];
      set(data, "subscription.coupons", coupons);

      const expected: IHullAccountAttributes = {
        "chargebee_subscription_1/activated_at": DateTime.fromSeconds(data.subscription.activated_at).toISO(),
        "chargebee_subscription_1/auto_collection": data.subscription.auto_collection,
        "chargebee_subscription_1/billing_period": data.subscription.billing_period,
        "chargebee_subscription_1/billing_period_unit": data.subscription.billing_period_unit,
        "chargebee_subscription_1/coupons_ids": coupons.map(c => c.coupon_id),
        "chargebee_subscription_1/coupons_codes": coupons.map(c => c.coupon_code),
        "chargebee_subscription_1/created_at": DateTime.fromSeconds(data.subscription.created_at).toISO(),
        "chargebee_subscription_1/currency_code": data.subscription.currency_code,
        "chargebee_subscription_1/current_term_end_date": DateTime.fromSeconds(data.subscription.current_term_end).toISO(),
        "chargebee_subscription_1/current_term_start_date": DateTime.fromSeconds(data.subscription.current_term_start).toISO(),
        "chargebee_subscription_1/customer_id": data.subscription.customer_id,
        "chargebee_subscription_1/deleted": data.subscription.deleted,
        "chargebee_subscription_1/due_invoices_count": data.subscription.due_invoices_count,
        "chargebee_subscription_1/due_since_date": DateTime.fromSeconds(data.subscription.due_since).toISO(),
        "chargebee_subscription_1/has_scheduled_changes": data.subscription.has_scheduled_changes,
        "chargebee_subscription_1/id": data.subscription.id,
        "chargebee_subscription_1/mrr": data.subscription.mrr,
        "chargebee_subscription_1/next_billing_at": DateTime.fromSeconds(data.subscription.next_billing_at).toISO(),
        "chargebee_subscription_1/object": data.subscription.object,
        "chargebee_subscription_1/plan_amount": data.subscription.plan_amount,
        "chargebee_subscription_1/plan_free_quantity": data.subscription.plan_free_quantity,
        "chargebee_subscription_1/plan_id": data.subscription.plan_id,
        "chargebee_subscription_1/plan_quantity": data.subscription.plan_quantity,
        "chargebee_subscription_1/plan_unit_price": data.subscription.plan_unit_price,
        "chargebee_subscription_1/resource_version": data.subscription.resource_version,
        "chargebee_subscription_1/started_at": DateTime.fromSeconds(data.subscription.started_at).toISO(),
        "chargebee_subscription_1/status": data.subscription.status,
        "chargebee_subscription_1/total_dues": data.subscription.total_dues,
        "chargebee_subscription_1/updated_at": DateTime.fromSeconds(data.subscription.updated_at).toISO()
      };

      const actual = util.mapSubscriptionToAttributesAccount(1, data.subscription);
      expect(actual).toEqual(expected);
    });
  });
});
