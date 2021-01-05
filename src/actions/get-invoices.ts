import { Request, Response, RequestHandler } from "express";
import { AwilixContainer } from "awilix";
import { SyncAgent } from "../core/sync-agent";
import { MappingUtil } from "../utils/mapping-util";

export const getInvoices = (): RequestHandler => {
  return async (req: Request, res: Response): Promise<unknown> => {

    const customerId = req.body.customerId;
    try {

      const scope = (req as any).scope as AwilixContainer;
      const syncAgent = new SyncAgent(scope);

      const invoices = await syncAgent.getCustomerInvoices(customerId);

      const mappingUtil = syncAgent.diContainer.resolve<MappingUtil>("mappingUtil");

      const invoiceResults = mappingUtil.mapCustomerInvoicesToAttributesAccount(
        customerId,
        invoices,
      );
      res.status(200).json({ identity: invoiceResults[0].ident, invoices: invoiceResults[0].hullOperationParams });
      return Promise.resolve(true);
    } catch (error) {
      res
        .status(500)
        .send({ error: { message: error.message } });
      return Promise.resolve(false);
    }
  };
};
