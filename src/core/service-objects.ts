export type ApiMethod =
  | "delete"
  | "get"
  | "GET"
  | "DELETE"
  | "head"
  | "HEAD"
  | "options"
  | "OPTIONS"
  | "post"
  | "POST"
  | "put"
  | "PUT"
  | "patch"
  | "PATCH"
  | "link"
  | "LINK"
  | "unlink"
  | "UNLINK";

export interface ApiResultObject<TPayload, TData, TError> {
  endpoint: string;
  method: ApiMethod;
  payload: TPayload | undefined;
  data?: TData;
  success: boolean;
  error?: string | string[];
  errorDetails?: TError;
}

export interface ListResult<TData> {
  list: Array<TData>;
  next_offset?: string;
}

export interface Customer {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  vat_number?: string;
  auto_collection: string;
  net_term_days: number;
  vat_number_validated_time?: number;
  vat_number_status?: string;
  allow_direct_debit: boolean;
  is_location_valid?: boolean;
  created_at: number;
  created_from_ip?: string;
  exemption_details?: any;
  taxability?: string;
  entity_code?: string;
  exempt_number?: string;
  resource_version?: number;
  updated_at?: number;
  locale?: string;
  consolidated_invoicing?: boolean;
  billing_date?: number;
  billing_date_mode?: string;
  billing_day_of_week?: string;
  billing_day_of_week_mode?: string;
  pii_cleared?: string;
  card_status?: string;
  fraud_flag?: string;
  primary_payment_source_id?: string;
  backup_payment_source_id?: string;
  billing_address?: BillingAddress;
  referral_urls?: Array<ReferralUrl>;
  contacts?: Array<Contact>;
  payment_method?: PaymentMethod;
  invoice_notes?: string;
  preferred_currency_code?: string;
  promotional_credits: number;
  unbilled_charges: number;
  refundable_credits: number;
  excess_payments: number;
  balances?: Array<Balance>;
  meta_data?: any;
  deleted: boolean;
  registered_for_gst?: boolean;
  customer_type?: string;
  business_customer_without_vat_number?: boolean;
  client_profile_id?: string;
  relationship?: Relationship;
  use_default_hierarchy_settings?: boolean;
  parent_account_access?: ParentAccountAccess;
  child_account_access?: ChildAccountAccess;
}

export interface BillingAddress {
  first_name?: string;
  last_name?: string;
  email?: string;
  company?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  line3?: string;
  city?: string;
  state_code?: string;
  state?: string;
  country?: string;
  zip?: string;
  validation_status?: string;
}

export interface ReferralUrl {
  external_customer_id?: string;
  referral_sharing_url: string;
  created_at: number;
  updated_at: number;
  referral_campaign_id: string;
  referral_account_id: string;
  referral_external_campaign_id?: string;
  referral_system: string;
}

export interface Contact {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  label?: string;
  enabled: boolean;
  send_account_email: boolean;
  send_billing_email: boolean;
}

export interface PaymentMethod {
  type: string;
  gateway: string;
  gateway_account_id?: string;
  status: string;
  reference_id: string;
}

export interface Balance {
  promotional_credits: number;
  excess_payments: number;
  refundable_credits: number;
  unbilled_charges: number;
  currency_code: string;
  balance_currency_code: string;
}

export interface Relationship {
  parent_id?: string;
  payment_owner_id: string;
  invoice_owner_id: string;
}

export interface ParentAccountAccess {
  portal_edit_child_subscriptions?: string;
  portal_download_child_invoices?: string;
  send_subscription_emails: boolean;
  send_invoice_emails: boolean;
  send_payment_emails: boolean;
}

export interface ChildAccountAccess {
  portal_edit_subscriptions?: string;
  portal_download_invoices?: string;
  send_subscription_emails: boolean;
  send_invoice_emails: boolean;
  send_payment_emails: boolean;
}

export interface Subscription {
  id: string;
  customer_id: string;
  currency_code: string;
  plan_id: string;
  plan_quantity: number;
  plan_unit_price?: number;
  setup_fee?: number;
  plan_amount?: number;
  billing_period?: number;
  billing_period_unit?: string;
  plan_free_quantity?: number;
  status: string;
  start_date?: number;
  trial_start?: number;
  trial_end?: number;
  current_term_start?: number;
  current_term_end?: number;
  next_billing_at?: number;
  remaining_billing_cycles?: number;
  po_number?: string;
  created_at?: number;
  started_at?: number;
  activated_at?: number;
  gift_id?: string;
  contract_term_billing_cycle_on_renewal?: number;
  override_relationship?: boolean;
  pause_date?: number;
  resume_date?: number;
  cancelled_at?: number;
  cancel_reason?: string;
  affiliate_token?: string;
  created_from_ip?: string;
  resource_version?: number;
  updated_at?: number;
  has_scheduled_changes: boolean;
  payment_source_id?: string;
  auto_collection?: string;
  due_invoices_count?: number;
  due_since?: number;
  total_dues?: number;
  mrr?: number;
  exchange_rate?: number;
  base_currency_code?: string;
  addons?: Array<Addon>;
  event_based_addons?: Array<EventBasedAddon>;
  charged_event_based_addons?: Array<ChargedEventBasedAddon>;
  coupon?: string;
  coupons?: Array<Coupon>;
  shipping_address?: ShippingAddress;
  referral_info?: ReferralInfo;
  invoice_notes?: string;
  meta_data?: any;
  deleted: boolean;
  contract_term?: ContractTerm;
  cancel_reason_code?: string;
}

export interface SubscriptionItem {
  item_price_id: string;
  item_type: string;
  quantity?: number;
  unit_price?: number;
  amount?: number;
  item_free_quantity?: number;
  trial_end?: number;
  billing_cycles?: number;
  service_period_in_days?: number;
  on_event?: string;
  charge_once?: boolean;
  charge_on?: string;
}

export interface Addon {
  id: string;
  quantity?: number;
  unit_price?: number;
  amount?: number;
  trial_end?: number;
  remaining_billing_cycles?: number;
}

export interface EventBasedAddon {
  id: string;
  quantity: number;
  unit_price: number;
  service_period_in_days?: number;
  on_event: string;
  charge_once: boolean;
}

export interface ChargedEventBasedAddon {
  id: string;
  last_charged_at: number;
}

export interface Coupon {
  coupon_id: string;
  apply_till?: number;
  applied_count: number;
  coupon_code?: string;
}

export interface ShippingAddress {
  first_name?: string;
  last_name?: string;
  email?: string;
  company?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  line3?: string;
  city?: string;
  state_code?: string;
  state?: string;
  country?: string;
  zip?: string;
  validation_status?: string;
}

export interface ReferralInfo {
  referral_code?: string;
  coupon_code?: string;
  referrer_id?: string;
  external_reference_id?: string;
  reward_status?: string;
  referral_system?: string;
  account_id: string;
  campaign_id: string;
  external_campaign_id?: string;
  friend_offer_type?: string;
  referrer_reward_type?: string;
  notify_referral_system?: string;
  destination_url?: string;
  post_purchase_widget_enabled: boolean;
}

export interface ContractTerm {
  id: string;
  status: string;
  contract_start: number;
  contract_end: number;
  billing_cycle: number;
  action_at_term_end: string;
  total_contract_value: number;
  cancellation_cutoff_period?: number;
  created_at: number;
  subscription_id: string;
  remaining_billing_cycles?: number;
}

export interface Card {
  payment_source_id: string;
  status: string;
  gateway: string;
  gateway_account_id?: string;
  ref_tx_id?: string;
  first_name?: string;
  last_name?: string;
  iin: string;
  last4: string;
  card_type?: string;
  funding_type: string;
  expiry_month: number;
  expiry_year: number;
  issuing_country?: string;
  billing_addr1?: string;
  billing_addr2?: string;
  billing_city?: string;
  billing_state_code?: string;
  billing_state?: string;
  billing_country?: string;
  billing_zip?: string;
  created_at: number;
  resource_version?: number;
  updated_at?: number;
  ip_address?: string;
  customer_id: string;
  masked_number?: string;
}

export interface Invoice {
  id: string;
  po_number?: string;
  customer_id: string;
  subscription_id?: string;
  recurring: boolean;
  status: string;
  vat_number?: string;
  price_type: string;
  date?: number;
  due_date?: number;
  net_term_days?: number;
  currency_code: string;
  total?: number;
  amount_paid?: number;
  amount_adjusted?: number;
  write_off_amount?: number;
  credits_applied?: number;
  amount_due?: number;
  paid_at?: number;
  dunning_status?: string;
  next_retry_at?: number;
  voided_at?: number;
  resource_version?: number;
  updated_at?: number;
  sub_total: number;
  sub_total_in_local_currency?: number;
  total_in_local_currency?: number;
  local_currency_code?: string;
  tax: number;
  first_invoice?: boolean;
  has_advance_charges?: boolean;
  term_finalized: boolean;
  is_gifted: boolean;
  expected_payment_date?: number;
  amount_to_collect?: number;
  round_off_amount?: number;
  line_items?: Array<LineItem>;
  discounts?: Array<Discount>;
  line_item_discounts?: Array<LineItemDiscount>;
  taxes?: Array<Tax>;
  line_item_taxes?: Array<LineItemTax>;
  line_item_tiers?: Array<LineItemTier>;
  linked_payments?: Array<LinkedPayment>;
  dunning_attempts?: Array<DunningAttempt>;
  applied_credits?: Array<AppliedCredit>;
  adjustment_credit_notes?: Array<AdjustmentCreditNote>;
  issued_credit_notes?: Array<IssuedCreditNote>;
  linked_orders?: Array<LinkedOrder>;
  notes?: Array<Note>;
  shipping_address?: ShippingAddress;
  billing_address?: BillingAddress;
  payment_owner?: string;
  void_reason_code?: string;
  deleted: boolean;
}

export interface LineItem {
  id?: string;
  subscription_id?: string;
  date_from: number;
  date_to: number;
  unit_amount: number;
  quantity?: number;
  amount?: number;
  pricing_model?: string;
  is_taxed: boolean;
  tax_amount?: number;
  tax_rate?: number;
  discount_amount?: number;
  item_level_discount_amount?: number;
  description: string;
  entity_description?: string;
  entity_type: string;
  tax_exempt_reason?: string;
  entity_id?: string;
  customer_id?: string;
}

export interface Discount {
  amount: number;
  description?: string;
  entity_type: string;
  entity_id?: string;
}

export interface LineItemDiscount {
  line_item_id: string;
  discount_type: string;
  coupon_id?: string;
  discount_amount: number;
}

export interface Tax {
  name: string;
  amount: number;
  description?: string;
}

export interface LineItemTax {
  line_item_id?: string;
  tax_name: string;
  tax_rate: number;
  is_partial_tax_applied?: boolean;
  is_non_compliance_tax?: boolean;
  taxable_amount: number;
  tax_amount: number;
  tax_juris_type?: string;
  tax_juris_name?: string;
  tax_juris_code?: string;
  tax_amount_in_local_currency?: number;
  local_currency_code?: string;
}

export interface LineItemTier {
  line_item_id?: string;
  starting_unit: number;
  ending_unit?: number;
  quantity_used: number;
  unit_amount: number;
}

export interface LinkedPayment {
  txn_id: string;
  applied_amount: number;
  applied_at: number;
  txn_status?: string;
  txn_date?: number;
  txn_amount?: number;
}

export interface DunningAttempt {
  attempt: number;
  transaction_id?: string;
  dunning_type: string;
  created_at?: number;
  txn_status?: string;
  txn_amount?: number;
}

export interface AppliedCredit {
  cn_id: string;
  applied_amount: number;
  applied_at: number;
  cn_reason_code?: string;
  cn_create_reason_code?: string;
  cn_date?: number;
  cn_status: string;
}

export interface AdjustmentCreditNote {
  cn_id: string;
  cn_reason_code?: string;
  cn_create_reason_code?: string;
  cn_date?: number;
  cn_total?: number;
  cn_status: string;
}

export interface IssuedCreditNote {
  cn_id: string;
  cn_reason_code?: string;
  cn_create_reason_code?: string;
  cn_date?: number;
  cn_total?: number;
  cn_status: string;
}

export interface LinkedOrder {
  id: string;
  document_number?: string;
  status?: string;
  order_type?: string;
  reference_id?: string;
  fulfillment_status?: string;
  batch_id?: string;
  created_at: number;
}

export interface Note {
  entity_type: string;
  note: string;
  entity_id?: string;
}

export interface ChargebeeEvent {
  api_version: string;
  content: {
    customer?: Customer;
    subscription?: Subscription;
    addon?: Addon;
    coupon?: Coupon;
    invoice?: Invoice;
    credit_note?: AdjustmentCreditNote;
  };
  event_type: ChargebeeEventType;
  id: string;
  object: string;
  occurred_at: number; // Timestamp in seconds
  source: string;
  user: string;
  webhook_status: string;
}

export type ChargebeeEventType =
  | "plan_created"
  | "plan_updated"
  | "plan_deleted"
  | "addon_created"
  | "addon_updated"
  | "addon_deleted"
  | "coupon_created"
  | "coupon_updated"
  | "coupon_deleted"
  | "coupon_set_created"
  | "coupon_set_updated"
  | "coupon_set_deleted"
  | "coupon_codes_created"
  | "coupon_codes_updated"
  | "coupon_codes_deleted"
  | "customer_created"
  | "customer_changed"
  | "customer_deleted"
  | "customer_moved_out"
  | "customer_moved_in"
  | "promotional_credits_added"
  | "promotional_credits_deducted"
  | "subscription_created"
  | "subscription_started"
  | "subscription_trial_end_reminder"
  | "subscription_activated"
  | "subscription_changed"
  | "mrr_updated"
  | "subscription_cancellation_scheduled"
  | "subscription_cancellation_reminder"
  | "subscription_cancelled"
  | "subscription_reactivated"
  | "subscription_renewed"
  | "subscription_scheduled_cancellation_removed"
  | "subscription_changes_scheduled"
  | "subscription_scheduled_changes_removed"
  | "subscription_shipping_address_updated"
  | "subscription_deleted"
  | "subscription_paused"
  | "subscription_pause_scheduled"
  | "subscription_scheduled_pause_removed"
  | "subscription_resumed"
  | "subscription_resumption_scheduled"
  | "subscription_scheduled_resumption_removed"
  | "subscription_advance_invoice_schedule_added"
  | "subscription_advance_invoice_schedule_updated"
  | "subscription_advance_invoice_schedule_removed"
  | "pending_invoice_created"
  | "pending_invoice_updated"
  | "invoice_generated"
  | "invoice_updated"
  | "invoice_deleted"
  | "credit_note_created"
  | "credit_note_updated"
  | "credit_note_deleted"
  | "subscription_renewal_reminder"
  | "transaction_created"
  | "transaction_updated"
  | "transaction_deleted"
  | "payment_succeeded"
  | "payment_failed"
  | "payment_refunded"
  | "payment_initiated"
  | "refund_initiated"
  | "authorization_succeeded"
  | "authorization_voided"
  | "card_added"
  | "card_expiry_reminder"
  | "card_expired"
  | "card_updated"
  | "card_deleted"
  | "payment_source_added"
  | "payment_source_updated"
  | "payment_source_deleted"
  | "payment_source_expiring"
  | "payment_source_expired"
  | "virtual_bank_account_added"
  | "virtual_bank_account_updated"
  | "virtual_bank_account_deleted"
  | "token_created"
  | "token_consumed"
  | "token_expired"
  | "unbilled_charges_created"
  | "unbilled_charges_voided"
  | "unbilled_charges_deleted"
  | "unbilled_charges_invoiced"
  | "order_created"
  | "order_updated"
  | "order_cancelled"
  | "order_delivered"
  | "order_returned"
  | "order_ready_to_process"
  | "order_ready_to_ship"
  | "order_deleted"
  | "quote_created"
  | "quote_updated"
  | "quote_deleted"
  | "gift_scheduled"
  | "gift_unclaimed"
  | "gift_claimed"
  | "gift_expired"
  | "gift_cancelled"
  | "gift_updated"
  | "hierarchy_created"
  | "hierarchy_deleted"
  | "payment_intent_created"
  | "payment_intent_updated"
  | "contract_term_created"
  | "contract_term_renewed"
  | "contract_term_terminated"
  | "contract_term_completed"
  | "contract_term_cancelled"
  | "item_family_created"
  | "item_family_updated"
  | "item_family_deleted"
  | "item_created"
  | "item_updated"
  | "item_deleted"
  | "item_price_created"
  | "item_price_updated"
  | "item_price_deleted"
  | "attached_item_created"
  | "attached_item_updated"
  | "attached_item_deleted"
  | "differential_price_created"
  | "differential_price_updated"
  | "differential_price_deleted";
