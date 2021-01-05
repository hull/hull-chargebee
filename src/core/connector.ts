export interface PrivateSettings {
  chargebee_site?: string | null;
  chargebee_api_key?: string | null;
  incoming_resolution_user: "external_id" | "email" | "none";
  incoming_resolution_account: "external_id" | "none";
  aggregation_account_invoices: boolean;
  aggregation_account_subscriptions: boolean;
}

export interface LogPayload {
  channel: "operational" | "metric" | "error";
  component: string;
  code: string;
  message?: string | null;
  metricKey?: string | null;
  metricValue?: number | null;
  errorDetails?: any | null;
  appId: string;
  tenantId: string;
  correlationKey?: string;
}

export type InvoiceAggregationType = "first" | "second_last" | "last";

export type ConnectorReadType = "all" | "incremental";

export type ConnectorFetchObjectType =
  | "customers"
  | "invoices"
  | "subscriptions"
  | "events";

export interface Schema$MapIncomingResult {
  ident: unknown;
  hullScope: "asUser" | "asAccount";
  hullOperation: "traits" | "track" | "alias" | "unalias";
  hullOperationParams: unknown[];
}
