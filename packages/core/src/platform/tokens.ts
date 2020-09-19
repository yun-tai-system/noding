import { InjectionToken, Injector } from "@noding/di";
import { Subject } from "rxjs";
import { Middleware } from "@noding/router";
export const ALLOW_MULTIPLE_PLATFORMS = new InjectionToken<boolean>(
  "@notadd/core ALLOW_MULTIPLE_PLATFORMS"
);
export const PLATFORM_ID = new InjectionToken<string>(
  `@notadd/core PLATFORM_ID`
);
export const PLATFORM_INITIALIZER = new InjectionToken<
  Array<(injector: Injector) => void>
>("@notadd/core PLATFORM_INITIALIZER");
export const PLATFORM_ANALYSIS = new InjectionToken<
  Array<(injector: Injector) => void>
>("@notadd/core PLATFORM_ANALYSIS");
export const APP_ANALYSIS = new InjectionToken<
  Array<(injector: Injector) => void>
>("@notadd/core APP_ANALYSIS");
export const APP_INSTALL = new InjectionToken<
  Array<(injector: Injector) => void>
>("@notadd/core APP_ANALYSIS");

export const OTHER_INITIALIZER = new InjectionToken<
  Array<(injector: Injector) => void>
>("@notadd/core APP_ANALYSIS");

export const APP_INITIALIZER = new InjectionToken<
  Array<(injector: Injector) => void>
>("@notadd/core APP_INITIALIZER");

export const CLI_INITIALIZER = new InjectionToken<
  Array<(injector: Injector) => void>
>("@notadd/core CLI_INITIALIZER");

export const LAZY_INITIALIZER = new InjectionToken<
  Array<(injector: Injector) => void>
>("@notadd/core LAZY_INITIALIZER");

export const ORM_INITIALIZER = new InjectionToken<
  Array<(injector: Injector) => void>
>("@notadd/core ORM_INITIALIZER");

export const CACHE_INITIALIZER = new InjectionToken<
  Array<(injector: Injector) => void>
>("@notadd/core CACHE_INITIALIZER");

export const MQ_INITIALIZER = new InjectionToken<
  Array<(injector: Injector) => void>
>("@notadd/core MQ_INITIALIZER");

export const SEARCH_INITIALIZER = new InjectionToken<
  Array<(injector: Injector) => void>
>("@notadd/core SEARCH_INITIALIZER");

export interface LazyModule {
  path: string;
  export: string;
}
export const LAZY_MODULES = new InjectionToken<Promise<Array<LazyModule>>>(
  "@notadd/core LAZY_MODULES"
);

export const MODULE_NAME = new InjectionToken<string>(
  `@notadd/core MODULE_NAME`
);

export const CURRENT = new InjectionToken<Promise<any>>(`@notadd/core CURRENT`);

export const PLATFORM_NAME = new InjectionToken<string>(
  `@notadd/core PLATFORM_NAME`
);

export const PLATFORM_TITLE = new InjectionToken<string>(
  `@notadd/core PLATFORM_TITLE`
);

/**
 * 入口路径
 */
export const MAIN_PATH = new InjectionToken<string>("@notadd/core MAIN_PATH");
export const ROOT_PATH = new InjectionToken<string>("@notadd/core ROOT_PATH");


export const GRAPHQL_FIELDS = new InjectionToken<Promise<string[]>>(
  `@notadd/graphql GRAPHQL_FIELDS`
);
export const GRPC_FIELDS = new InjectionToken<string[]>(
  `@notadd/graphql GRPC_FIELDS`
);

export interface Action<T> {
  action: string;
  payload: T;
}
export const APP_EVENT = new InjectionToken<Subject<Action<any>>>(
  `@notadd/graphql APP_HOOKS`
);

export const LAZY_MODULE_INIT = new InjectionToken<any>(
  `@notadd/core LAZY_MODULE_INIT`
);

/**
 * 方法上的 中间件
 */
export const CONTROLLER_METHOD_MIDDLEWARES = new InjectionToken<Middleware[]>(
  `@notadd/core CONTROLLER_METHOD_MIDDLEWARES`
);
