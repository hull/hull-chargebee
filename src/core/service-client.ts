import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { ApiResultObject, Customer, ApiMethod, ListResult, Subscription, Card, Invoice } from "./service-objects";
import { DateTime } from "luxon";
import { isNil, set, unset } from "lodash";
import { ApiUtil } from "../utils/api-util";
import qs from "querystring";

export class ServiceClient {
  public readonly apiKey: string;
  public readonly site: string;

  constructor(options: any) {
    this.apiKey = options.chargebeeApiKey;
    this.site = options.chargebeeSite;
  }

  public async listCustomers(
    afterUpdatedAt: string,
    offset?: string,
    includeDeleted?: boolean,
  ): Promise<ApiResultObject<undefined, ListResult<{ customer: Customer}>, AxiosError>> {
    const url = `https://${this.site}.chargebee.com/api/v2/customers`;
    const method: ApiMethod = "get";
    const params = {
      "updated_at[after]": Math.round(DateTime.fromISO(afterUpdatedAt).toSeconds()),
      "sort_by[desc]": "updated_at",
      limit: 100
    };

    if(!isNil(offset)) {
      set(params, "offset", offset);
    }

    if (!isNil(includeDeleted)) {
      set(params, "include_deleted", includeDeleted);
    }

    const config: AxiosRequestConfig = {
      ...this.getAxiosConfig(),
      params
    };

    const fullUrl = `${url}?${qs.stringify(params)}`;

    try {
      const response = await axios.get<ListResult<{ customer: Customer}>>(url, config);
      return ApiUtil.handleApiResultSuccess<undefined, ListResult<{ customer: Customer}>, AxiosError>(fullUrl, method, undefined, response.data);
    } catch (error) {
      return ApiUtil.handleApiResultError<undefined, ListResult<{ customer: Customer}>, AxiosError>(fullUrl, method, undefined, error);
    }
  }

  public async listSubscriptions(
    afterUpdatedAt: string,
    offset?: string,
    includeDeleted?: boolean,
    customerIds?: string[]
  ): Promise<ApiResultObject<undefined, ListResult<{ subscription: Subscription, customer: Customer, card?: Card }>, AxiosError>> {
    const url = `https://${this.site}.chargebee.com/api/v2/subscriptions`;
    const method: ApiMethod = "get";
    const params = {
      "updated_at[after]": Math.round(DateTime.fromISO(afterUpdatedAt).toSeconds()),
      "sort_by[desc]": "updated_at",
      limit: 100,
      "customer_id[in]": undefined as any
    };

    if(!isNil(offset)) {
      set(params, "offset", offset);
    }

    if (!isNil(includeDeleted)) {
      set(params, "include_deleted", includeDeleted);
    }

    if(!isNil(customerIds)) {
      params["customer_id[in]"] = JSON.stringify(customerIds);
    } else {
      unset(params, "customer_id[in]");
    }

    const config: AxiosRequestConfig = {
      ...this.getAxiosConfig(),
      params
    };

    const fullUrl = `${url}?${qs.stringify(params)}`;

    try {
      const response = await axios.get<ListResult<{ subscription: Subscription, customer: Customer, card?: Card }>>(url, config);
      return ApiUtil.handleApiResultSuccess<undefined, ListResult<{ subscription: Subscription, customer: Customer, card?: Card }>, AxiosError>(fullUrl, method, undefined, response.data);
    } catch (error) {
      return ApiUtil.handleApiResultError<undefined, ListResult<{ subscription: Subscription, customer: Customer, card?: Card }>, AxiosError>(fullUrl, method, undefined, error);
    }
  }

  public async listInvoices(
    afterUpdatedAt: string,
    offset?: string,
    includeDeleted?: boolean,
    customerIds?: string[]
  ): Promise<ApiResultObject<undefined, ListResult<{ invoice: Invoice }>, AxiosError>> {
    const url = `https://${this.site}.chargebee.com/api/v2/invoices`;
    const method: ApiMethod = "get";
    const params = {
      "updated_at[after]": Math.round(DateTime.fromISO(afterUpdatedAt).toSeconds()),
      "sort_by[desc]": "updated_at",
      limit: 100,
      "customer_id[in]": undefined as any
    };

    if(!isNil(offset)) {
      set(params, "offset", offset);
    }

    if (!isNil(includeDeleted)) {
      set(params, "include_deleted", includeDeleted);
    }

    if(!isNil(customerIds)) {
      params["customer_id[in]"] = JSON.stringify(customerIds);
    } else {
      unset(params, "customer_id[in]");
    }

    const config: AxiosRequestConfig = {
      ...this.getAxiosConfig(),
      params
    };

    const fullUrl = `${url}?${qs.stringify(params)}`;

    try {
      const response = await axios.get<ListResult<{ invoice: Invoice }>>(url, config);
      return ApiUtil.handleApiResultSuccess<undefined, ListResult<{ invoice: Invoice }>, AxiosError>(fullUrl, method, undefined, response.data);
    } catch (error) {
      return ApiUtil.handleApiResultError<undefined, ListResult<{ invoice: Invoice }>, AxiosError>(fullUrl, method, undefined, error);
    }
  }



  private getAxiosConfig(): AxiosRequestConfig {
    const config: AxiosRequestConfig = {
      auth: {
        username: this.apiKey,
        password: "X"
      },
      headers: {
        Accept: "application/json"
      },
      paramsSerializer: (params: any): string => {
        return qs.stringify(params);
      }
    };

    return config;
  }
}
