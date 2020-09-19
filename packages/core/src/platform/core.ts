import { createPlatformFactory } from "./createPlatformFactory";
import { PlatformRef } from "./platformRef";
import {
  Injector,
  ProxyHandler,
  Providers,
  StaticInjector,
  StaticProvider,
  providerToStaticProvider,
  isPromise,
  SKIP_MULTIS,
} from "@noding/di";
import { Router, router } from "@noding/router";
import {
  IClassDecorator,
  getINgerDecorator,
  INgerDecorator,
  IParameterDecorator,
  isType,
} from "@noding/decorator";
import {
  ControllerMetadataKey,
  ControllerOptions,
  ArgsMetadataKey,
  ArgsOptions,
  ARGS,
} from "../controller/decorator";
import { useGuardProvider } from "../provider";
import {
  APP_EVENT,
  PLATFORM_INITIALIZER,
  LAZY_INITIALIZER,
  APP_INSTALL,
  ORM_INITIALIZER,
  CACHE_INITIALIZER,
  MQ_INITIALIZER,
  SEARCH_INITIALIZER,
  PLATFORM_ANALYSIS,
  APP_ANALYSIS,
  APP_INITIALIZER,
  OTHER_INITIALIZER,
  CLI_INITIALIZER,
  ROOT_PATH,
} from "./tokens";
import { Subject, isObservable } from "rxjs";
import { ModuleOptions, ModuleMetadataKey, NgModuleRef } from "../module";
import { ControllerRef } from "../module/controller.ref";
import { pluck } from "rxjs/operators";
import { paramProvider } from "./param";
import { Logger } from "../logger";
export function providersToStaticProviders(
  providers: Providers
): StaticProvider[] {
  if (Array.isArray(providers)) {
    return providers
      .map((pro: any) => providersToStaticProviders(pro).flat())
      .flat();
  } else {
    return [providerToStaticProvider(providers)];
  }
}
export const platformCore = createPlatformFactory(null, `core`, [
  useGuardProvider,
  paramProvider,
  {
    provide: ArgsMetadataKey,
    useValue: new ProxyHandler({
      methodParams: (
        parameters: Array<any>,
        parameter: IParameterDecorator<any, ArgsOptions>,
        injector: Injector
      ) => {
        const options = parameter.options;
        const args = injector.get(ARGS);
        if (options) {
          if (isObservable(args)) {
            return args.pipe(pluck(options.key));
          } else if (isPromise(args)) {
            return args.then((res) => Reflect.get(res, options.key));
          } else {
            return Reflect.get(args, options.key);
          }
        }
        return args;
      },
    }),
  },
  {
    provide: ControllerMetadataKey,
    useFactory: () => {
      const cls = (
        cls: IClassDecorator<any, ControllerOptions>,
        root: Injector
      ) => {
        const nger = getINgerDecorator(cls.type);
        const options = cls.options;
        let injector = root;
        if (options) {
          const providers = options.providers || [];
          injector = injector.create(
            [...providersToStaticProviders(providers)],
            "controller_factory"
          );
        }
        const ref = new ControllerRef(nger, injector);
        const module = injector.get(NgModuleRef);
        module.addControllerRef(cls.type, ref);
      };
      return new ProxyHandler({
        class: cls,
      });
    },
  },
  {
    provide: ModuleMetadataKey,
    useFactory: () => {
      let deep: number = 0;
      function setDeep(d: number) {
        const old = deep;
        deep = d;
        return old;
      }
      const cls = (
        cls: IClassDecorator<any, ModuleOptions>,
        injector: Injector
      ): {
        injector: Injector;
        handlers: { index: number; type: string; handle: Function }[];
        providers: Providers[];
      } => {
        const moduleInjector = injector.create(
          [
            {
              provide: NgModuleRef,
              useFactory: (root: Injector) => {
                return new NgModuleRef(root, cls.type);
              },
              deps: [Injector],
            },
          ],
          cls.type.name
        );
        const options = cls.options;
        const old = setDeep(deep + 1);
        try {
          if (options) {
            let { controllers, imports, providers } = options;
            const handlers: {
              index: number;
              type: string;
              handle: Function;
            }[] = [];
            if (imports) {
              imports.map((it) => {
                if (!isType(it)) {
                  providers = [...(providers || []), ...it.providers];
                }
              });
              imports.map((it) => {
                let nger: INgerDecorator<any, any>;
                if (isType(it)) {
                  nger = getINgerDecorator(it);
                } else {
                  nger = getINgerDecorator(it.ngModule);
                }
                const subHandlers = nger.classes
                  .map((ngerCls) => {
                    const handler = moduleInjector.get<ProxyHandler>(
                      ngerCls.metadataKey
                    );
                    if (handler) {
                      const result = handler.class(ngerCls, moduleInjector);
                      if (
                        Reflect.has(result, "providers") &&
                        Reflect.has(result, "handlers")
                      ) {
                        const skips = injector.get(SKIP_MULTIS, []);
                        /**
                         * 下一级的providers
                         */
                        let resultProviders: any[] = [];
                        if (deep > 0) {
                          const handle = (providers: any[]) =>
                            providers.map((it) => {
                              if (Array.isArray(it)) {
                                handle(it);
                              } else {
                                if (skips.includes(it.provide)) {
                                  return;
                                } else {
                                  resultProviders.push(it);
                                }
                              }
                            });
                          handle(result.providers);
                        } else {
                          resultProviders = result.providers;
                        }
                        providers = [...(providers || []), ...resultProviders];
                        return result.handlers;
                      } else {
                        throw new Error(`imports must has Module Decorator`);
                      }
                    }
                    return [];
                  })
                  .flat();
                handlers.push(...subHandlers);
              });
            }
            if (controllers) {
              controllers.forEach((controller) => {
                const nger = getINgerDecorator(controller);
                nger.classes.forEach((ngerCls) => {
                  handlers.push({
                    index: deep,
                    type: "controllers",
                    handle: () => {
                      try {
                        const handler = injector.get<ProxyHandler>(
                          ngerCls.metadataKey
                        );
                        if (handler) {
                          handler.class(ngerCls, moduleInjector);
                        }
                      } catch (e) {
                        const logger = injector.get(Logger);
                        logger.error(e.message, e.stack);
                      }
                    },
                  });
                });
              });
            }
            if (providers) {
              if (moduleInjector instanceof StaticInjector) {
                handlers.push({
                  index: deep,
                  type: "providers",
                  handle: () => {
                    moduleInjector.addProviders(
                      providersToStaticProviders(providers || [])
                    );
                  },
                });
              }
            }
            return {
              injector: moduleInjector,
              handlers,
              providers: providers || [],
            };
          }
        } finally {
          const ref = moduleInjector.get(PlatformRef);
          ref.addInjector(cls.type, moduleInjector);
          setDeep(old);
        }
        return {
          injector: moduleInjector,
          handlers: [],
          providers: [],
        };
      };
      return new ProxyHandler({
        class: cls,
      });
    },
  },
  {
    provide: APP_EVENT,
    useValue: new Subject(),
  },
  {
    provide: PlatformRef,
    useFactory: (injector: Injector) => {
      return new PlatformRef(injector);
    },
    deps: [Injector],
  },
  {
    provide: Router,
    useValue: router,
    deps: [],
  },
  {
    provide: SKIP_MULTIS,
    useValue: [
      PLATFORM_INITIALIZER,
      LAZY_INITIALIZER,
      APP_INSTALL,
      ORM_INITIALIZER,
      CACHE_INITIALIZER,
      MQ_INITIALIZER,
      SEARCH_INITIALIZER,
      PLATFORM_ANALYSIS,
      APP_ANALYSIS,
      APP_INITIALIZER,
      OTHER_INITIALIZER,
      CLI_INITIALIZER,
    ],
  },
  {
    provide: ROOT_PATH,
    useValue: ROOT_PATH,
  },
]);
