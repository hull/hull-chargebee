import { createContainer, asValue, AwilixContainer } from "awilix";
import { CORRELATION_KEY, APP_ID, APP_SECRET, APP_ORG } from "../_helpers/constants";
import { ContextMock } from "../_helpers/mocks";
import { SyncAgent } from "../../src/core/sync-agent";

describe("SyncAgent", () => {
  let container: AwilixContainer | undefined;
  let loggerMock;

  beforeEach(() => {
    container = createContainer();
    loggerMock = {
      info: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    };
    container.register("logger", asValue(loggerMock));
    container.register("correlationKey", asValue(CORRELATION_KEY));
    container.register("hullAppId", asValue(APP_ID));
    container.register("hullAppSecret", asValue(APP_SECRET));
    container.register("hullAppOrganization", asValue(APP_ORG));
    const ctx = new ContextMock(APP_ID, {}, {
      aggregation_account_invoices: false,
      aggregation_account_subscriptions: false,
      incoming_resolution_account: "none",
      incoming_resolution_user: "none",
    });
    container.register("hullClient", asValue(ctx.client));
    container.register("hullMetricsClient", asValue(ctx.metric));
    container.register("hullConnectorMeta", asValue(ctx.ship));
  });

  afterEach(async () => {
    if(container) {
      await container.dispose();
    }
  });

  describe("#constructor()", () => {
    it("should initialize readonly variables", () => {
      const agent = new SyncAgent(container as AwilixContainer);
      expect(agent.diContainer).toBeDefined();
    });
  });
});
