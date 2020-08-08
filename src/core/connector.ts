export interface PrivateSettings {
  chargebee_site?: string | null;
  chargebee_api_key?: string | null;
  
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
