import IHullClient from "../types/hull-client";
import { Schema$MapIncomingResult } from "../core/connector";

export class HullUtil {
  public readonly hull: IHullClient;

  constructor(options: any) {
    this.hull = options.hullClient;
  }

  public async processIncomingData(
    params: Schema$MapIncomingResult[],
  ): Promise<unknown> {
    const promises = params.map((param) => {
      return (this.hull[param.hullScope](param.ident as any) as any)[
        param.hullOperation
      ](...param.hullOperationParams);
    });

    return Promise.all(promises);
  }
}
