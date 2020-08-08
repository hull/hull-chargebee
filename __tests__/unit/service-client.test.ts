import { API_KEY, API_SITE } from "../_helpers/constants";
import { ServiceClient } from "../../src/core/service-client";
import { DateTime } from "luxon";
import nock from "nock";
import ApiResponseListCustomers from "../_data/api__list_customers.json";
import ApiResponseListSubscriptions from "../_data/api__list_subscriptions.json";
import ApiResponseListInvoices from "../_data/api__list_invoices.json";
import { ApiResultObject, ListResult, Customer, Subscription, Card, Invoice } from "../../src/core/service-objects";
import { AxiosError } from "axios";
import qs from "querystring";

describe("ServiceClient", () => {
  describe("#constructor()", () => {
    it("should initialize readonly variables", () => {
      const options = {
        chargebeeApiKey: API_KEY,
        chargebeeSite: API_SITE
      };

      const client = new ServiceClient(options);
      expect(client.apiKey).toEqual(API_KEY);
      expect(client.site).toEqual(API_SITE);
    });
  });

  describe("#listCustomers()", () => {
    const options = {
      chargebeeApiKey: API_KEY,
      chargebeeSite: API_SITE
    };


    it("should list all customers if call is successful", async() => {
    const limit = 100;
    const updatedAfter = DateTime.fromSeconds(1596370165);

    nock(`https://${API_SITE}.chargebee.com`)
      .get(`/api/v2/customers?updated_at[after]=1596370165&sort_by[desc]=updated_at&limit=${limit}`)
      .matchHeader(
        "authorization",
        `Basic ${Buffer.from(`${API_KEY}:X`, "utf-8").toString("base64")}`,
      )
      .reply(200, ApiResponseListCustomers, {
        "content-type": "application/json;charset=utf-8",
        "cache-control": "no-store, no-cache, must-revalidate",
        "strict-transport-security": "max-age=604800; includeSubDomains; preload",
        "pragma": "no-cache",
        "server": "ChargeBee"
      });

      const client = new ServiceClient(options);
      const actual = await client.listCustomers(updatedAfter.toISO() as string);
      const expected: ApiResultObject<undefined, ListResult<{ customer: Customer}>, AxiosError> = {
        endpoint: `https://${API_SITE}.chargebee.com/api/v2/customers?updated_at%5Bafter%5D=1596370165&sort_by%5Bdesc%5D=updated_at&limit=${limit}`,
        method: "get",
        payload: undefined,
        success: true,
        data: ApiResponseListCustomers,
        error:undefined,
        errorDetails: undefined
      };

      expect(actual).toEqual(expected);
    });

    it("should list all customers including deleted ones if call is successful", async() => {
      const limit = 100;
      const updatedAfter = DateTime.fromSeconds(1596370165);

      nock(`https://${API_SITE}.chargebee.com`)
        .get(`/api/v2/customers?updated_at[after]=1596370165&sort_by[desc]=updated_at&limit=${limit}&include_deleted=true`)
        .matchHeader(
          "authorization",
          `Basic ${Buffer.from(`${API_KEY}:X`, "utf-8").toString("base64")}`,
        )
        .reply(200, ApiResponseListCustomers, {
          "content-type": "application/json;charset=utf-8",
          "cache-control": "no-store, no-cache, must-revalidate",
          "strict-transport-security": "max-age=604800; includeSubDomains; preload",
          "pragma": "no-cache",
          "server": "ChargeBee"
        });

        const client = new ServiceClient(options);
        const actual = await client.listCustomers(updatedAfter.toISO() as string, undefined, true);
        const expected: ApiResultObject<undefined, ListResult<{ customer: Customer}>, AxiosError> = {
          endpoint: `https://${API_SITE}.chargebee.com/api/v2/customers?updated_at%5Bafter%5D=1596370165&sort_by%5Bdesc%5D=updated_at&limit=${limit}&include_deleted=true`,
          method: "get",
          payload: undefined,
          success: true,
          data: ApiResponseListCustomers,
          error:undefined,
          errorDetails: undefined
        };

        expect(actual).toEqual(expected);
    });

    it("should list all customers including the offset if call is successful", async() => {
      const limit = 100;
      const updatedAfter = DateTime.fromSeconds(1596370165);
      const offset = "[\"1517469236000\",\"205000003470\"]";

      nock(`https://${API_SITE}.chargebee.com`)
        .get(`/api/v2/customers?updated_at[after]=1596370165&sort_by[desc]=updated_at&limit=${limit}&offset=${offset}`)
        .matchHeader(
          "authorization",
          `Basic ${Buffer.from(`${API_KEY}:X`, "utf-8").toString("base64")}`,
        )
        .reply(200, ApiResponseListCustomers, {
          "content-type": "application/json;charset=utf-8",
          "cache-control": "no-store, no-cache, must-revalidate",
          "strict-transport-security": "max-age=604800; includeSubDomains; preload",
          "pragma": "no-cache",
          "server": "ChargeBee"
        });

        const client = new ServiceClient(options);
        const actual = await client.listCustomers(updatedAfter.toISO() as string, offset);
        const expected: ApiResultObject<undefined, ListResult<{ customer: Customer}>, AxiosError> = {
          endpoint: `https://${API_SITE}.chargebee.com/api/v2/customers?updated_at%5Bafter%5D=1596370165&sort_by%5Bdesc%5D=updated_at&limit=${limit}&offset=${encodeURIComponent(offset)}`,
          method: "get",
          payload: undefined,
          success: true,
          data: ApiResponseListCustomers,
          error:undefined,
          errorDetails: undefined
        };

        expect(actual).toEqual(expected);
    });

    it("should return an error result and not throw if API responds with status 500", async() => {
      const limit = 100;
      const updatedAfter = DateTime.fromSeconds(1596370165);

      nock(`https://${API_SITE}.chargebee.com`)
        .get(`/api/v2/customers?updated_at[after]=1596370165&sort_by[desc]=updated_at&limit=${limit}`)
        .matchHeader(
          "authorization",
          `Basic ${Buffer.from(`${API_KEY}:X`, "utf-8").toString("base64")}`,
        )
        .replyWithError("Some arbitrary error");

        const client = new ServiceClient(options);
        const actual = await client.listCustomers(updatedAfter.toISO() as string);
        const expected: ApiResultObject<undefined, ListResult<{ customer: Customer}>, AxiosError> = {
          endpoint: `https://${API_SITE}.chargebee.com/api/v2/customers?updated_at%5Bafter%5D=1596370165&sort_by%5Bdesc%5D=updated_at&limit=${limit}`,
          method: "get",
          payload: undefined,
          success: false,
          data: undefined,
          error: "Some arbitrary error",
          errorDetails: new Error("Some arbitrary error") as any
        };

        expect(actual).toMatchObject(expected);
      });
  });

  describe("#listSubscriptions()", () => {
    const options = {
      chargebeeApiKey: API_KEY,
      chargebeeSite: API_SITE
    };


    it("should list all subscriptions if call is successful", async() => {
    const limit = 100;
    const updatedAfter = DateTime.fromSeconds(1596370165);

    nock(`https://${API_SITE}.chargebee.com`)
      .get(`/api/v2/subscriptions?updated_at[after]=1596370165&sort_by[desc]=updated_at&limit=${limit}`)
      .matchHeader(
        "authorization",
        `Basic ${Buffer.from(`${API_KEY}:X`, "utf-8").toString("base64")}`,
      )
      .reply(200, ApiResponseListSubscriptions, {
        "content-type": "application/json;charset=utf-8",
        "cache-control": "no-store, no-cache, must-revalidate",
        "strict-transport-security": "max-age=604800; includeSubDomains; preload",
        "pragma": "no-cache",
        "server": "ChargeBee"
      });

      const client = new ServiceClient(options);
      const actual = await client.listSubscriptions(updatedAfter.toISO() as string);
      const expected: ApiResultObject<undefined, ListResult<{ subscription: Subscription, customer: Customer, card?: Card }>, AxiosError> = {
        endpoint: `https://${API_SITE}.chargebee.com/api/v2/subscriptions?updated_at%5Bafter%5D=1596370165&sort_by%5Bdesc%5D=updated_at&limit=${limit}`,
        method: "get",
        payload: undefined,
        success: true,
        data: ApiResponseListSubscriptions,
        error:undefined,
        errorDetails: undefined
      };

      expect(actual).toEqual(expected);
    });

    it("should list all subscriptions including deleted ones if call is successful", async() => {
      const limit = 100;
      const updatedAfter = DateTime.fromSeconds(1596370165);

      nock(`https://${API_SITE}.chargebee.com`)
        .get(`/api/v2/subscriptions?updated_at[after]=1596370165&sort_by[desc]=updated_at&limit=${limit}&include_deleted=true`)
        .matchHeader(
          "authorization",
          `Basic ${Buffer.from(`${API_KEY}:X`, "utf-8").toString("base64")}`,
        )
        .reply(200, ApiResponseListSubscriptions, {
          "content-type": "application/json;charset=utf-8",
          "cache-control": "no-store, no-cache, must-revalidate",
          "strict-transport-security": "max-age=604800; includeSubDomains; preload",
          "pragma": "no-cache",
          "server": "ChargeBee"
        });

        const client = new ServiceClient(options);
        const actual = await client.listSubscriptions(updatedAfter.toISO() as string, undefined, true);
        const expected: ApiResultObject<undefined, ListResult<{ subscription: Subscription, customer: Customer, card?: Card }>, AxiosError> = {
          endpoint: `https://${API_SITE}.chargebee.com/api/v2/subscriptions?updated_at%5Bafter%5D=1596370165&sort_by%5Bdesc%5D=updated_at&limit=${limit}&include_deleted=true`,
          method: "get",
          payload: undefined,
          success: true,
          data: ApiResponseListSubscriptions,
          error:undefined,
          errorDetails: undefined
        };

        expect(actual).toEqual(expected);
    });

    it("should list all subscriptions including the offset if call is successful", async() => {
        const limit = 100;
        const updatedAfter = DateTime.fromSeconds(1596370165);
        const offset = "[\"1517469236000\",\"205000003470\"]";

        nock(`https://${API_SITE}.chargebee.com`)
          .get(`/api/v2/subscriptions?updated_at[after]=1596370165&sort_by[desc]=updated_at&limit=${limit}&offset=${offset}`)
          .matchHeader(
            "authorization",
            `Basic ${Buffer.from(`${API_KEY}:X`, "utf-8").toString("base64")}`,
          )
          .reply(200, ApiResponseListSubscriptions, {
            "content-type": "application/json;charset=utf-8",
            "cache-control": "no-store, no-cache, must-revalidate",
            "strict-transport-security": "max-age=604800; includeSubDomains; preload",
            "pragma": "no-cache",
            "server": "ChargeBee"
          });

          const client = new ServiceClient(options);
          const actual = await client.listSubscriptions(updatedAfter.toISO() as string, offset);
          const expected: ApiResultObject<undefined, ListResult<{ subscription: Subscription, customer: Customer, card?: Card }>, AxiosError> = {
            endpoint: `https://${API_SITE}.chargebee.com/api/v2/subscriptions?updated_at%5Bafter%5D=1596370165&sort_by%5Bdesc%5D=updated_at&limit=${limit}&offset=${encodeURIComponent(offset)}`,
            method: "get",
            payload: undefined,
            success: true,
            data: ApiResponseListSubscriptions,
            error:undefined,
            errorDetails: undefined
          };

          expect(actual).toEqual(expected);
    });

    it("should list all subscriptions for the given customer ids if call is successful", async() => {
      const limit = 100;
      const updatedAfter = DateTime.fromSeconds(1596370165);
      const customerIds = ["123456", "404164640"];

      const params = {
        "updated_at[after]": updatedAfter.toSeconds(),
        "sort_by[desc]": "updated_at",
        limit: 100,
        "customer_id[in]": JSON.stringify(customerIds)
      };

      nock(`https://${API_SITE}.chargebee.com`)
        .get(`/api/v2/subscriptions?${qs.stringify(params)}`)
        .matchHeader(
          "authorization",
          `Basic ${Buffer.from(`${API_KEY}:X`, "utf-8").toString("base64")}`,
        )
        .reply(200, ApiResponseListSubscriptions, {
          "content-type": "application/json;charset=utf-8",
          "cache-control": "no-store, no-cache, must-revalidate",
          "strict-transport-security": "max-age=604800; includeSubDomains; preload",
          "pragma": "no-cache",
          "server": "ChargeBee"
        });

        const client = new ServiceClient(options);
        const actual = await client.listSubscriptions(updatedAfter.toISO() as string, undefined, undefined, customerIds);
        const expected: ApiResultObject<undefined, ListResult<{ subscription: Subscription, customer: Customer, card?: Card }>, AxiosError> = {
          endpoint: `https://${API_SITE}.chargebee.com/api/v2/subscriptions?${qs.stringify(params)}`,
          method: "get",
          payload: undefined,
          success: true,
          data: ApiResponseListSubscriptions,
          error:undefined,
          errorDetails: undefined
        };

        expect(actual).toEqual(expected);
    });

    it("should return an error result and not throw if API responds with status 500", async() => {
      const limit = 100;
      const updatedAfter = DateTime.fromSeconds(1596370165);

      nock(`https://${API_SITE}.chargebee.com`)
        .get(`/api/v2/subscriptions?updated_at[after]=1596370165&sort_by[desc]=updated_at&limit=${limit}`)
        .matchHeader(
          "authorization",
          `Basic ${Buffer.from(`${API_KEY}:X`, "utf-8").toString("base64")}`,
        )
        .replyWithError("Some arbitrary error");

        const client = new ServiceClient(options);
        const actual = await client.listSubscriptions(updatedAfter.toISO() as string);
        const expected: ApiResultObject<undefined, ListResult<{ subscription: Subscription, customer: Customer, card?: Card }>, AxiosError> = {
          endpoint: `https://${API_SITE}.chargebee.com/api/v2/subscriptions?updated_at%5Bafter%5D=1596370165&sort_by%5Bdesc%5D=updated_at&limit=${limit}`,
          method: "get",
          payload: undefined,
          success: false,
          data: undefined,
          error: "Some arbitrary error",
          errorDetails: new Error("Some arbitrary error") as any
        };

        expect(actual).toMatchObject(expected);
    });
  });

  describe("#listInvoices()", () => {
    const options = {
      chargebeeApiKey: API_KEY,
      chargebeeSite: API_SITE
    };


    it("should list all invoices if call is successful", async() => {
    const limit = 100;
    const updatedAfter = DateTime.fromSeconds(1596370165);

    nock(`https://${API_SITE}.chargebee.com`)
      .get(`/api/v2/invoices?updated_at[after]=1596370165&sort_by[desc]=updated_at&limit=${limit}`)
      .matchHeader(
        "authorization",
        `Basic ${Buffer.from(`${API_KEY}:X`, "utf-8").toString("base64")}`,
      )
      .reply(200, ApiResponseListInvoices, {
        "content-type": "application/json;charset=utf-8",
        "cache-control": "no-store, no-cache, must-revalidate",
        "strict-transport-security": "max-age=604800; includeSubDomains; preload",
        "pragma": "no-cache",
        "server": "ChargeBee"
      });

      const client = new ServiceClient(options);
      const actual = await client.listInvoices(updatedAfter.toISO() as string);
      const expected: ApiResultObject<undefined, ListResult<{ invoice: Invoice }>, AxiosError> = {
        endpoint: `https://${API_SITE}.chargebee.com/api/v2/invoices?updated_at%5Bafter%5D=1596370165&sort_by%5Bdesc%5D=updated_at&limit=${limit}`,
        method: "get",
        payload: undefined,
        success: true,
        data: ApiResponseListInvoices,
        error:undefined,
        errorDetails: undefined
      };

      expect(actual).toEqual(expected);
    });

    it("should list all invoices including deletes ones if call is successful", async() => {
      const limit = 100;
      const updatedAfter = DateTime.fromSeconds(1596370165);

      nock(`https://${API_SITE}.chargebee.com`)
        .get(`/api/v2/invoices?updated_at[after]=1596370165&sort_by[desc]=updated_at&limit=${limit}&include_deleted=true`)
        .matchHeader(
          "authorization",
          `Basic ${Buffer.from(`${API_KEY}:X`, "utf-8").toString("base64")}`,
        )
        .reply(200, ApiResponseListInvoices, {
          "content-type": "application/json;charset=utf-8",
          "cache-control": "no-store, no-cache, must-revalidate",
          "strict-transport-security": "max-age=604800; includeSubDomains; preload",
          "pragma": "no-cache",
          "server": "ChargeBee"
        });

      const client = new ServiceClient(options);
      const actual = await client.listInvoices(updatedAfter.toISO() as string, undefined, true);
      const expected: ApiResultObject<undefined, ListResult<{ invoice: Invoice }>, AxiosError> = {
        endpoint: `https://${API_SITE}.chargebee.com/api/v2/invoices?updated_at%5Bafter%5D=1596370165&sort_by%5Bdesc%5D=updated_at&limit=${limit}&include_deleted=true`,
        method: "get",
        payload: undefined,
        success: true,
        data: ApiResponseListInvoices,
        error:undefined,
        errorDetails: undefined
      };

      expect(actual).toEqual(expected);
    });

    it("should list all invoices including offset if call is successful", async() => {
      const limit = 100;
      const updatedAfter = DateTime.fromSeconds(1596370165);
      const offset = "[\"1517469236000\",\"205000003470\"]";

      nock(`https://${API_SITE}.chargebee.com`)
        .get(`/api/v2/invoices?updated_at[after]=1596370165&sort_by[desc]=updated_at&limit=${limit}&offset=${offset}`)
        .matchHeader(
          "authorization",
          `Basic ${Buffer.from(`${API_KEY}:X`, "utf-8").toString("base64")}`,
        )
        .reply(200, ApiResponseListInvoices, {
          "content-type": "application/json;charset=utf-8",
          "cache-control": "no-store, no-cache, must-revalidate",
          "strict-transport-security": "max-age=604800; includeSubDomains; preload",
          "pragma": "no-cache",
          "server": "ChargeBee"
        });

      const client = new ServiceClient(options);
      const actual = await client.listInvoices(updatedAfter.toISO() as string, offset);
      const expected: ApiResultObject<undefined, ListResult<{ invoice: Invoice }>, AxiosError> = {
        endpoint: `https://${API_SITE}.chargebee.com/api/v2/invoices?updated_at%5Bafter%5D=1596370165&sort_by%5Bdesc%5D=updated_at&limit=${limit}&offset=${encodeURIComponent(offset)}`,
        method: "get",
        payload: undefined,
        success: true,
        data: ApiResponseListInvoices,
        error:undefined,
        errorDetails: undefined
      };

      expect(actual).toEqual(expected);
    });

    it("should list all invoices for the given customer ids if call is successful", async() => {
      const limit = 100;
      const updatedAfter = DateTime.fromSeconds(1596370165);
      const customerIds = ["123456", "404164640"];

      const params = {
        "updated_at[after]": updatedAfter.toSeconds(),
        "sort_by[desc]": "updated_at",
        limit: 100,
        "customer_id[in]": JSON.stringify(customerIds)
      };

      nock(`https://${API_SITE}.chargebee.com`)
        .get(`/api/v2/invoices?${qs.stringify(params)}`)
        .matchHeader(
          "authorization",
          `Basic ${Buffer.from(`${API_KEY}:X`, "utf-8").toString("base64")}`,
        )
        .reply(200, ApiResponseListInvoices, {
          "content-type": "application/json;charset=utf-8",
          "cache-control": "no-store, no-cache, must-revalidate",
          "strict-transport-security": "max-age=604800; includeSubDomains; preload",
          "pragma": "no-cache",
          "server": "ChargeBee"
        });

        const client = new ServiceClient(options);
        const actual = await client.listInvoices(updatedAfter.toISO() as string, undefined, undefined, customerIds);
        const expected: ApiResultObject<undefined, ListResult<{ invoice: Invoice }>, AxiosError> = {
          endpoint: `https://${API_SITE}.chargebee.com/api/v2/invoices?${qs.stringify(params)}`,
          method: "get",
          payload: undefined,
          success: true,
          data: ApiResponseListInvoices,
          error:undefined,
          errorDetails: undefined
        };

        expect(actual).toEqual(expected);
    });

    it("should return an error result and not throw if API responds with status 500", async() => {
      const limit = 100;
      const updatedAfter = DateTime.fromSeconds(1596370165);

      nock(`https://${API_SITE}.chargebee.com`)
        .get(`/api/v2/invoices?updated_at[after]=1596370165&sort_by[desc]=updated_at&limit=${limit}`)
        .matchHeader(
          "authorization",
          `Basic ${Buffer.from(`${API_KEY}:X`, "utf-8").toString("base64")}`,
        )
        .replyWithError("Some arbitrary error");

        const client = new ServiceClient(options);
        const actual = await client.listInvoices(updatedAfter.toISO() as string);
        const expected: ApiResultObject<undefined, ListResult<{ invoice: Invoice }>, AxiosError> = {
          endpoint: `https://${API_SITE}.chargebee.com/api/v2/invoices?updated_at%5Bafter%5D=1596370165&sort_by%5Bdesc%5D=updated_at&limit=${limit}`,
          method: "get",
          payload: undefined,
          success: false,
          data: undefined,
          error: "Some arbitrary error",
          errorDetails: new Error("Some arbitrary error") as any
        };

        expect(actual).toMatchObject(expected);
    });
  });
});
