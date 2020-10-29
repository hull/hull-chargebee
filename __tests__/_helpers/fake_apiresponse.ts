import { random, date, name, internet, company, address } from "faker";
import { DateTime } from "luxon";
import { ListResult, ChargebeeEvent } from "../../src/core/service-objects";

const fakeCustomerCreatedEvent = (): ChargebeeEvent => {
  const ts = DateTime.fromISO(date.recent(1).toISOString()).toSeconds();
  const result: ChargebeeEvent = {
    api_version: "v2",
    event_type: "customer_created",
    id: `ev_${random.alphaNumeric()}`,
    object: "event",
    occurred_at: DateTime.fromISO(date.recent(1).toISOString()).toSeconds(),
    source: "api",
    user: "full_access_key_v1",
    webhook_status: "succeeded",
    content: {
      customer: {
        id: `${random.number()}`,
        first_name: name.firstName(),
        last_name: name.lastName(),
        email: internet.email(),
        company: company.companyName(),
        auto_collection: "on",
        net_term_days: 0,
        allow_direct_debit: false,
        created_at: ts,
        taxability: "taxable",
        updated_at: ts,
        pii_cleared: "active",
        resource_version: random.number(),
        deleted: false,
        billing_address: {
          city: address.city(),
          state: address.state(),
          state_code: address.stateAbbr(),
          country: address.countryCode(),
          validation_status: "not_validated",
        },
        card_status: "no_card",
        promotional_credits: 0,
        refundable_credits: 0,
        excess_payments: 0,
        unbilled_charges: 0,
        preferred_currency_code: "USD",
        meta_data: {
          customer_key: random.number(),
        },
      },
    },
  };

  return result;
};

export const fakeListEventsResponse = (
  limit: number,
  hasNextOffset: boolean = false,
): ListResult<{ event: ChargebeeEvent }> => {
  const result: ListResult<{ event: ChargebeeEvent }> = { list: [] };
  for (let index = 0; index < limit; index++) {
    result.list.push({ event: fakeCustomerCreatedEvent() });
  }

  if (hasNextOffset === true) {
    result.next_offset = random.alphaNumeric();
  }

  return result;
};
