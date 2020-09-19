import { InjectionToken } from "./injectionToken";
import { Injector } from "./injector";
import { INgerDecorator, IMethodDecorator, Type } from "@noding/decorator";
export abstract class ErrorFilter {
  abstract catch<T>(error: Error, injector: Injector): T;
}
export const INJECTOR = new InjectionToken<Injector>("INJECTOR", -1 as any);
/**
 * 装饰器扫描器
 */
export interface GetIngerDecorator<T = any, O = any> {
  (type: Type<T>): INgerDecorator<T, O>;
}
export const GET_INGER_DECORATOR = new InjectionToken<GetIngerDecorator>(
  `GET_INGER_DECORATOR`
);

export const METHOD_ARGS = new InjectionToken<any[]>(
  `@notadd/core METHOD_ARGS`
);
export const METHOD_RESULT = new InjectionToken<any>(
  `@notadd/core METHOD_RESULT`
);
export const METHOD_NGER = new InjectionToken<IMethodDecorator<any, any>>(
  `@notadd/core METHOD_NGER`
);
export const METHOD_ERROR = new InjectionToken<IMethodDecorator<any, any>>(
  `@notadd/core METHOD_ERROR`
);
export const CLASS_NGER = new InjectionToken<INgerDecorator<any, any>>(
  `@notadd/core CLASS_NGER`
);

/**
 * 默认全局异常处理
 */
export const DEFAULT_ERROR_FILTER = new InjectionToken<ErrorFilter>(
  `@notadd/core DEFAULT_ERROR_FILTER`
);

export const SKIP_MULTIS = new InjectionToken<InjectionToken<any>[]>(
  `@notadd/core SKIP_MULTIS`
);
