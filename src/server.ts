import { Application } from "express";
import { smartNotifierHandler } from "hull/lib/utils";
import { createContainer, asValue, asClass } from "awilix";
import { createLogger, LoggerOptions, format, transports } from "winston";
import actions from "./actions";
import cors from "cors";
import _ from "lodash";
import { ClientOpts } from "redis";
import { ConnectorRedisClient } from "./utils/redis-client";
import { initializeScope } from "./middleware/express-scope";
import bodyParser from "body-parser";

export const server = (app: Application): Application => {
  // DI Container
  const container = createContainer();

  // Instantiate the global logger
  const loggerOptions: LoggerOptions = {
    level: process.env.LOG_LEVEL || "error",
    format: format.combine(format.simple()),
    defaultMeta: {
      service: process.env.LOG_SERVICENAME || "hull-chargebee",
      environment: process.env.NODE_ENV || "development",
    },
  };
  // Add console as transport since we don't use a dedicated transport
  // but rely on the OS to ship logs if we don't push it out to logz.io
  if (process.env.NODE_ENV === "development") {
    loggerOptions.transports = [
      new transports.Console({
        format: format.combine(
          format.colorize({ all: true }),
          format.timestamp(),
          format.align(),
          format.printf((info) => {
            const { timestamp, level, message, ...args } = info;
            const { meta } = info;
            let metaStructured = "";

            if (meta) {
              metaStructured = `${meta.component}#${meta.method}`;
              delete args.meta;
            }

            let appInfo = "";

            if (args.service) {
              appInfo = args.service;
              delete args.service;
            }

            return `[${appInfo}]  ${timestamp} | ${level} | ${metaStructured} |${message} ${
              Object.keys(args).length > 0 ? JSON.stringify(args, null, 2) : ""
            }`;
          }),
        ),
      })
    ];
  } else {
    loggerOptions.transports = [
      new transports.Console({
        level: "info",
        format: format.combine(format.json())
      })
    ];
  }

  const globalLogger = createLogger(loggerOptions);

  // DI for Redis
  const redisClientOpts: ClientOpts = {
    url: process.env.REDIS_URL,
  };

  // Register all the defualt jazz in the DI Container
  container.register({
    redisClient: asClass(ConnectorRedisClient).singleton(),
    redisClientOpts: asValue(redisClientOpts),
    logger: asValue(globalLogger),
    appSecret: asValue(process.env.SECRET || "secret"),
    nforceRedirectUrl: asValue(process.env.NFORCE_REDIRECTURL),
  });

  // Apply general purpose middleware depending on DI
  initializeScope(app, container);

  // Set the view engine to ejs
  app.set("view engine", "ejs");

  // CORS enabled endpoints
  app.use("/fetch/:objecttype/:mode", cors(), actions.fetch());

  // Status endpoints
  app.use("/status", actions.status());

  app.post(
    "/get-subscription",
    bodyParser.json(),
    actions.getSubscription()
  );

  app.post(
    "/get-invoices",
    bodyParser.json(),
    actions.getInvoices()
  );

  // Dispose the container when the server closes
  app.on("close", () => {
    globalLogger.debug("Shutting down application on CLOSE...");
    container.dispose();
  });

  process.on("SIGINT", () => {
    globalLogger.debug("Shutting down application on SIGINT...");
    if (!container) {
      return;
    }
    container.dispose();
  });

  return app;
};
