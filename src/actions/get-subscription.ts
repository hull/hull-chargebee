import { Request, Response, RequestHandler } from "express";
import { AwilixContainer } from "awilix";
import { SyncAgent } from "../core/sync-agent";
import { MappingUtil } from "../utils/mapping-util";

export const getSubscription = (): RequestHandler => {
  return async (req: Request, res: Response): Promise<unknown> => {

    const customerId = req.body.customerId;
    try {

      const scope = (req as any).scope as AwilixContainer;
      const syncAgent = new SyncAgent(scope);

      const subscriptions = await syncAgent.getCustomerSubscriptions(customerId);

      const mappingUtil = syncAgent.diContainer.resolve<MappingUtil>("mappingUtil");

      const subResults = mappingUtil.mapCustomerSubscriptionsToAttributesAccount(
        customerId,
        subscriptions,
      );
      res.status(200).json({ identity: subResults[0].ident, subscriptions: subResults[0].hullOperationParams });
      return Promise.resolve(true);
    } catch (error) {
      res
        .status(500)
        .send({ error: { message: error.message } });
      return Promise.resolve(false);
    }
  };
};
