import { InjectionToken } from "@noding/di";

export abstract class Logger {
  abstract info(...args: any[]): any;
  abstract error(...args: any[]): any;
  abstract warn(...args: any[]): any;
  abstract log(...args: any[]): any;
  abstract debug(...args: any[]): any;
  abstract verbose(...args: any[]): any;
}
export type LoggerLevel =
  | "info"
  | "warn"
  | "debug"
  | "verbose"
  | "log"
  | "error";
export const LOGGER_LEVEL = new InjectionToken<LoggerLevel[]>(
  `@notadd/core LOGGER_LEVEL`
);
export const LOGGER_TIME = new InjectionToken<boolean>(
  `@notadd/core LOGGER_TIME`
);
export const LOGGER_CONTEXT = new InjectionToken<string>(
  `@notadd/core LOGGER_CONTEXT`
);
export const LOGGER_METHOD = new InjectionToken<string>(
  `@notadd/core LOGGER_METHOD`
);
export abstract class LoggerFactory {
  abstract create(context: string): Logger;
}
