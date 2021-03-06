import { statusActionFactory } from "./status";
import { fetchActionFactory } from "./fetch";
import { getSubscription } from "./get-subscription";

export default {
  status: statusActionFactory,
  fetch: fetchActionFactory,
  getSubscription
};
