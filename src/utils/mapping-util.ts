import { PrivateSettings, InvoiceAggregationType } from "../core/connector";
import { Logger } from "winston";
import { Customer, ReferralUrl, Contact, Invoice, Note, LinkedOrder, Tax, Discount, LineItem, Subscription, Addon, EventBasedAddon, ChargedEventBasedAddon, Coupon } from "../core/service-objects";
import { IHullUserClaims, IHullUserAttributes } from "../types/user";
import { set, isNil, forIn, snakeCase, sum } from "lodash";
import { IHullAccountClaims, IHullAccountAttributes } from "../types/account";
import { DateTime } from "luxon";
import IHullUserEvent from "../types/user-event";

const ATTRIBUTE_GROUP_INCOMING = "chargebee";

export class MappingUtil {
  public readonly privateSettings: PrivateSettings;
  public readonly logger: Logger;

  constructor(options: any) {
    this.privateSettings = options.hullAppSettings;
    this.logger = options.logger;
  }

  public mapCustomerToIdentityUser(data: Customer): IHullUserClaims {
    const claims: IHullUserClaims = {
      anonymous_id: `chargebee:${data.id}`
    };

    switch (this.privateSettings.incoming_resolution_user) {
      case "external_id":
        set(claims, "external_id", data.id);
        break;
      case "email":
        set(claims, "email", data.email);
        break;
      default:
        // Todo: Log warning
        break;
    }

    return claims;
  }

  public mapCustomerToIdentityAccount(data: Customer): IHullAccountClaims {
    const claims: IHullAccountClaims = {
      anonymous_id: `chargebee:${data.id}`
    };

    switch (this.privateSettings.incoming_resolution_account) {
      case "external_id":
        set(claims, "external_id", data.id);
        break;
      default:
        // Todo: Log warning
        break;
    }

    return claims;
  }

  public mapCustomerToAttributesUser(data: Customer): IHullUserAttributes {
    const attribs: IHullUserAttributes = {};

    forIn(data, (v, k) => {
      switch (k) {
        case "created_at":
        case "billing_date":
        case "updated_at":
          set(attribs, `${ATTRIBUTE_GROUP_INCOMING}/${k}`, DateTime.fromSeconds(v).toISO());
          break;
        case "referral_urls":
          set(attribs, `${ATTRIBUTE_GROUP_INCOMING}/${k}`, v ? v.map((ru: ReferralUrl) => ru.referral_sharing_url) : []);
          break;
        case "contacts":
          set(attribs, `${ATTRIBUTE_GROUP_INCOMING}/${k}_emails`, v ? v.map((c: Contact) => c.email) : []);
          break;
        case "meta_data":
          forIn(v, (v2, k2) => {
            set(attribs, `${ATTRIBUTE_GROUP_INCOMING}/${k}_${snakeCase(k2)}`, v2);
          });
          break;
        default:
          set(attribs, `${ATTRIBUTE_GROUP_INCOMING}/${k}`, v);
          break;
      }
    });

    // Handle TLAs
    if(!isNil(data.first_name)) {
      set(attribs, "first_name", { value: data.first_name, operation: "setIfNull" } );
    }

    if(!isNil(data.last_name)) {
      set(attribs, "last_name", { value: data.last_name, operation: "setIfNull" } );
    }

    return attribs;
  }

  public mapCustomerToAttributesAccount(data: Customer): IHullAccountAttributes {
    const attribs: IHullUserAttributes = {};

    forIn(data, (v, k) => {
      switch (k) {
        case "created_at":
        case "billing_date":
        case "updated_at":
          set(attribs, `${ATTRIBUTE_GROUP_INCOMING}/${k}`, DateTime.fromSeconds(v).toISO());
          break;
        case "referral_urls":
          set(attribs, `${ATTRIBUTE_GROUP_INCOMING}/${k}`, v ? v.map((ru: ReferralUrl) => ru.referral_sharing_url) : []);
          break;
        case "contacts":
          set(attribs, `${ATTRIBUTE_GROUP_INCOMING}/${k}_emails`, v ? v.map((c: Contact) => c.email) : []);
          break;
        case "meta_data":
          forIn(v, (v2, k2) => {
            set(attribs, `${ATTRIBUTE_GROUP_INCOMING}/${k}_${snakeCase(k2)}`, v2);
          });
          break;
        default:
          set(attribs, `${ATTRIBUTE_GROUP_INCOMING}/${k}`, v);
          break;
      }
    });

    // Handle TLAs
    if(!isNil(data.company)) {
      set(attribs, "name", { value: data.company, operation: "setIfNull" } );
    }

    return attribs;
  }

  public mapInvoiceToUserEvent(data: Invoice): IHullUserEvent {
    const hullEvent: IHullUserEvent = {
      event: "Invoice updated",
      created_at: DateTime.fromSeconds(data.updated_at as number).toISO() as string,
      event_id: `${data.id}-${data.resource_version}`,
      context: {
        created_at: DateTime.fromSeconds(data.updated_at as number).toISO() as string,
        event_id: `${data.id}-${data.resource_version}`,
        ip: 0,
        source: "chargebee"
      },
      properties: {}
    };

    forIn(data, (v, k) => {
      switch (k) {
        case "date":
          set(hullEvent, `properties.invoice_${k}`, DateTime.fromSeconds(v as number).toISO());
          break;
        case "due_date":
        case "paid_at":
        case "voided_at":
        case "updated_at":
        case "expected_payment_date":
          set(hullEvent, `properties.${k}`, DateTime.fromSeconds(v as number).toISO());
          break;
        case "line_items":
          set(hullEvent, `properties.${k}_ids`, (v as Array<LineItem> | undefined | null) ? (v as Array<LineItem>).map(li=> li.id).join(", "): null);
          set(hullEvent, `properties.${k}_quantities`, (v as Array<LineItem> | undefined | null) ? (v as Array<LineItem>).map(li=> li.quantity).join(", "): null);
          set(hullEvent, `properties.${k}_amounts`, (v as Array<LineItem> | undefined | null) ? (v as Array<LineItem>).map(li=> li.amount).join(", "): null);
          set(hullEvent, `properties.${k}_descriptions`, (v as Array<LineItem> | undefined | null) ? (v as Array<LineItem>).map(li=> li.description).join(", "): null);
          break;

        case "linked_orders":
          set(hullEvent, `properties.${k}_ids`, (v as Array<LinkedOrder> | undefined | null) ? (v as Array<LinkedOrder>).map(lo => lo.id): null);
          break;
        case "notes":
          set(hullEvent, `properties.${k}`, (v as Array<Note> | undefined | null) ? (v as Array<Note>).map(n => n.note).join(" "): null);
          break;
        case "discounts":
        case "taxes":
        case "line_item_discounts":
        case "line_item_taxes":
        case "line_item_tiers":
        case "linked_payments":
        case "dunning_attempts":
        case "applied_credits":
        case "adjustment_credit_notes":
        case "issued_credit_notes":
          break;
        default:
          set(hullEvent, `properties.${k}`, v);
          break;
      }
    });

    return hullEvent;
  }

  public mapInvoiceAggregationToAttributesAccount(aggregationType: InvoiceAggregationType, data: Invoice): IHullAccountAttributes {
    let attribGroup = "chargebee";
    switch (aggregationType) {
      case "first":
        attribGroup += "_first_invoice";
        break;
      default:
        attribGroup += "_latest_invoice"
        break;
    }

    const attribs: IHullAccountAttributes = {};
    forIn(data, (v, k) => {
      switch (k) {
        case "date":
          set(attribs, `${attribGroup}/invoice_${k}`, DateTime.fromSeconds(v as number).toISO());
          break;
        case "due_date":
        case "paid_at":
        case "voided_at":
        case "updated_at":
        case "expected_payment_date":
          set(attribs, `${attribGroup}/${k}`, DateTime.fromSeconds(v as number).toISO());
          break;
        case "line_items":
          set(attribs, `${attribGroup}/${k}_ids`, (v as Array<LineItem> | undefined | null) ? (v as Array<LineItem>).map(li=> li.id): null);
          set(attribs, `${attribGroup}/${k}_quantities`, (v as Array<LineItem> | undefined | null) ? (v as Array<LineItem>).map(li=> li.quantity): null);
          set(attribs, `${attribGroup}/${k}_amounts`, (v as Array<LineItem> | undefined | null) ? (v as Array<LineItem>).map(li=> li.amount): null);
          set(attribs, `${attribGroup}/${k}_descriptions`, (v as Array<LineItem> | undefined | null) ? (v as Array<LineItem>).map(li=> li.description): null);
          break;

        case "linked_orders":
          set(attribs, `${attribGroup}/${k}_ids`, (v as Array<LinkedOrder> | undefined | null) ? (v as Array<LinkedOrder>).map(lo => lo.id): null);
          break;
        case "notes":
          set(attribs, `${attribGroup}/${k}`, (v as Array<Note> | undefined | null) ? (v as Array<Note>).map(n => n.note).join(" "): null);
          break;
        case "discounts":
        case "taxes":
        case "line_item_discounts":
        case "line_item_taxes":
        case "line_item_tiers":
        case "linked_payments":
        case "dunning_attempts":
        case "applied_credits":
        case "adjustment_credit_notes":
        case "issued_credit_notes":
          break;
        default:
          set(attribs, `${attribGroup}/${k}`, v);
          break;
      }
    });

    return attribs;
  }

  public mapSubscriptionToUserEvent(data: Subscription): IHullUserEvent {
    const hullEvent: IHullUserEvent = {
      event: data.created_at === data.updated_at ? "Subscription created" : "Subscription updated",
      created_at: DateTime.fromSeconds(data.updated_at as number).toISO() as string,
      event_id: `${data.id}-${data.resource_version}`,
      context: {
        created_at: DateTime.fromSeconds(data.updated_at as number).toISO() as string,
        event_id: `${data.id}-${data.resource_version}`,
        ip: 0,
        source: "chargebee"
      },
      properties: {}
    };

    forIn(data, (v, k) => {
      switch (k) {
        case "start_date":
        case "next_billing_at":
        case "created_at":
        case "started_at":
        case "activated_at":
        case "pause_date":
        case "resume_date":
        case "cancelled_at":
        case "updated_at":
          set(hullEvent, `properties.${k}`, DateTime.fromSeconds(v as number).toISO());
          break;
        case "trial_start":
        case "trial_end":
        case "current_term_start":
        case "current_term_end":
        case "due_since":
          set(hullEvent, `properties.${k}_date`, DateTime.fromSeconds(v as number).toISO());
          break;
        case "addons":
          set(hullEvent, `properties.${k}_ids`, (v as Array<Addon> | undefined | null) ? (v as Array<Addon>).map(a=> a.id).join(", "): null);
          set(hullEvent, `properties.${k}_quantities`, (v as Array<Addon> | undefined | null) ? (v as Array<Addon>).map(a=> a.quantity).join(", "): null);
          set(hullEvent, `properties.${k}_unit_prices`, (v as Array<Addon> | undefined | null) ? (v as Array<Addon>).map(a=> a.unit_price).join(", "): null);
          set(hullEvent, `properties.${k}_amounts`, (v as Array<Addon> | undefined | null) ? (v as Array<Addon>).map(a=> a.amount).join(", "): null);
          break;
        case "event_based_addons":
            set(hullEvent, `properties.${k}_ids`, (v as Array<EventBasedAddon> | undefined | null) ? (v as Array<EventBasedAddon>).map(a=> a.id).join(", "): null);
            set(hullEvent, `properties.${k}_quantities`, (v as Array<EventBasedAddon> | undefined | null) ? (v as Array<EventBasedAddon>).map(a=> a.quantity).join(", "): null);
            set(hullEvent, `properties.${k}_unit_prices`, (v as Array<EventBasedAddon> | undefined | null) ? (v as Array<EventBasedAddon>).map(a=> a.unit_price).join(", "): null);
            break;
        case "charged_event_based_addons":
          set(hullEvent, `properties.${k}_ids`, (v as Array<ChargedEventBasedAddon> | undefined | null) ? (v as Array<ChargedEventBasedAddon>).map(a=> a.id).join(", "): null);
          break;
        case "coupons":
          set(hullEvent, `properties.${k}_ids`, (v as Array<Coupon> | undefined | null) ? (v as Array<Coupon>).map(a=> a.coupon_id).join(", "): null);
          set(hullEvent, `properties.${k}_codes`, (v as Array<Coupon> | undefined | null) ? (v as Array<Coupon>).map(a=> a.coupon_code).join(", "): null);
          break;
        default:
          set(hullEvent, `properties.${k}`, v);
          break;
      }
    });

    return hullEvent;
  }

  public mapSubscriptionToAttributesAccount(counter: number, data: Subscription): IHullAccountAttributes {
    const attribGroup = `chargebee_subscription_${counter}`;
    const attribs: IHullAccountAttributes = {};

    forIn(data, (v, k) => {
      switch (k) {
        case "start_date":
        case "next_billing_at":
        case "created_at":
        case "started_at":
        case "activated_at":
        case "pause_date":
        case "resume_date":
        case "cancelled_at":
        case "updated_at":
          set(attribs, `${attribGroup}/${k}`, DateTime.fromSeconds(v as number).toISO());
          break;
        case "trial_start":
        case "trial_end":
        case "current_term_start":
        case "current_term_end":
        case "due_since":
          set(attribs, `${attribGroup}/${k}_date`, DateTime.fromSeconds(v as number).toISO());
          break;
        case "addons":
          set(attribs, `${attribGroup}/${k}_ids`, (v as Array<Addon> | undefined | null) ? (v as Array<Addon>).map(a=> a.id): null);
          set(attribs, `${attribGroup}/${k}_quantities`, (v as Array<Addon> | undefined | null) ? (v as Array<Addon>).map(a=> a.quantity): null);
          set(attribs, `${attribGroup}/${k}_unit_prices`, (v as Array<Addon> | undefined | null) ? (v as Array<Addon>).map(a=> a.unit_price): null);
          set(attribs, `${attribGroup}/${k}_amounts`, (v as Array<Addon> | undefined | null) ? (v as Array<Addon>).map(a=> a.amount): null);
          break;
        case "event_based_addons":
            set(attribs, `${attribGroup}/${k}_ids`, (v as Array<EventBasedAddon> | undefined | null) ? (v as Array<EventBasedAddon>).map(a=> a.id): null);
            set(attribs, `${attribGroup}/${k}_quantities`, (v as Array<EventBasedAddon> | undefined | null) ? (v as Array<EventBasedAddon>).map(a=> a.quantity): null);
            set(attribs, `${attribGroup}/${k}_unit_prices`, (v as Array<EventBasedAddon> | undefined | null) ? (v as Array<EventBasedAddon>).map(a=> a.unit_price): null);
            break;
        case "charged_event_based_addons":
          set(attribs, `${attribGroup}/${k}_ids`, (v as Array<ChargedEventBasedAddon> | undefined | null) ? (v as Array<ChargedEventBasedAddon>).map(a=> a.id): null);
          break;
        case "coupons":
          set(attribs, `${attribGroup}/${k}_ids`, (v as Array<Coupon> | undefined | null) ? (v as Array<Coupon>).map(a=> a.coupon_id): null);
          set(attribs, `${attribGroup}/${k}_codes`, (v as Array<Coupon> | undefined | null) ? (v as Array<Coupon>).map(a=> a.coupon_code): null);
          break;
        default:
          set(attribs, `${attribGroup}/${k}`, v);
          break;
      }
    });

    return attribs;
  }
}