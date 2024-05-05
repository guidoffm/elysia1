import { DaprClient, LogLevel, LoggerOptions } from "@dapr/dapr";

export function createDaprClient(): DaprClient {
  return new DaprClient({
    daprPort: process.env.DAPR_HTTP_PORT || '3500',
    daprHost: process.env.DAPR_HTTP_HOST || 'localhost',
    logger: {
      logLevel: LogLevel.Debug,
      logToConsole: true,
    } as LoggerOptions,
  });
}