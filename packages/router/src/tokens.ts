import { InjectionToken } from "@noding/di";
import { Middleware } from "./types";
export const HTTP_URL = new InjectionToken<string>(`@nger/core HTTP_URL`);
export const HTTP_METHOD = new InjectionToken<string>(`@nger/core HTTP_METHOD`);
export const METHOD_MIDDLEWARES = new InjectionToken<Middleware[]>(
  `@nger/core METHOD_MIDDLEWARES`
);
