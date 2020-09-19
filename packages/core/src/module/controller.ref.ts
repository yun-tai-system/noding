import { Type } from "@noding/decorator";
import {
  Injector,
  ProxyHandler,
  METHOD_ARGS,
  METHOD_RESULT,
  METHOD_NGER,
  providerToStaticProvider,
  InjectionToken,
  StaticInjector,
} from "@noding/di";
import { IMethodDecorator, INgerDecorator } from "@noding/decorator";
import {
  Middleware,
  createMiddlewarInjector,
  METHOD_MIDDLEWARES,
} from "@noding/router";
import {
  LOGGER_CONTEXT,
  LOGGER_METHOD,
  Logger,
  LoggerFactory,
} from "../logger";
import { EntityService } from "../entity";
export const CONTROLLER_MIDDLEWARES = new InjectionToken<Middleware[]>(
  `@notadd/core CONTROLLER_MIDDLEWARES`
);
export class ControllerMethodRef<T> {
  get type(): Type<T> {
    return this.method.type;
  }
  get injector(): Injector {
    return this._injector;
  }
  get method() {
    return this._method;
  }
  constructor(
    private _method: IMethodDecorator<T, any>,
    private _injector: Injector
  ) {}
  async create(
    middlewars: Middleware[]
  ): Promise<(...args: any[]) => Injector> {
    const method = this.method;
    middlewars.push(
      new Middleware(
        this.method.property as string,
        async (root: Injector | Promise<Injector>) => {
          const injector = await root;
          return injector.create(
            [
              {
                provide: EntityService,
                useFactory: (injector: Injector) => new EntityService(injector),
                deps: [Injector],
              },
            ],
            this.method.property as string
          );
        }
      )
    );
    const cmids = this.injector.get(CONTROLLER_MIDDLEWARES, []);
    middlewars.push(...cmids);
    middlewars.push(
      new Middleware(
        "METHOD_MIDDLEWARES",
        async (root: Injector | Promise<Injector>) => {
          const injector = await root;
          if (injector instanceof StaticInjector) {
            injector.addProviders([
              {
                provide: METHOD_MIDDLEWARES,
                useValue: middlewars,
              },
            ]);
          }
          return injector;
        }
      )
    );
    const injector = await createMiddlewarInjector(
      [...middlewars],
      this.injector
    );
    /**
     * 生效钩子
     */
    const instance = injector.get(this.type);
    const old = Reflect.get(instance as any, this.method.property);
    return (...args: any[]) => {
      let resultFactory = () => old.bind(this)(...args);
      let parameters = args;
      if (method) {
        // (a: number)
        parameters = new Array(method.paramTypes.length).fill(undefined);
        const _params = parameters.map((parameter, index) => {
          // usePipe body
          const parameters = method.parameters.filter(
            (it) => it.parameterIndex === index
          );
          const value = parameters.reverse().reduce((pre, next) => {
            const handler = injector.get<ProxyHandler>(next.metadataKey);
            if (handler) {
              return handler.methodParams(pre, next, injector);
            }
            return pre;
          }, parameter);
          return value;
        });
        args.forEach((item, index) => {
          Reflect.set(_params, index, item);
        });
        resultFactory = () => {
          return old.bind(instance)(..._params);
        };
      }
      const methodInjector = injector.create(
        [
          {
            provide: LOGGER_METHOD,
            useValue: this.method.property,
          },
          {
            provide: LOGGER_CONTEXT,
            useValue: this.type.name,
          },
          {
            provide: METHOD_ARGS,
            useValue: parameters,
          },
          {
            provide: METHOD_RESULT,
            useFactory: resultFactory,
          },
          {
            provide: METHOD_NGER,
            useValue: method,
          },
          {
            provide: Logger,
            useFactory: () => {
              const factory = this.injector.get(LoggerFactory);
              return factory.create(
                `${this.type.name}.${method.property as string}`
              );
            },
            deps: [Injector],
          },
        ],
        "method"
      );
      return methodInjector;
    };
  }
}

export class ControllerRef<T> {
  get type(): Type<T> {
    return this._nger.type;
  }
  get injector(): Injector {
    return this._injector;
  }
  get nger() {
    return this._nger;
  }
  get instance() {
    return this.injector.get(this.type);
  }
  methods: Map<any, ControllerMethodRef<T>> = new Map();
  constructor(
    private _nger: INgerDecorator<T, any>,
    private _injector: Injector
  ) {
    const provider = providerToStaticProvider(this.type);
    provider.noCache = true;
    const injector = this.injector.create(
      [
        {
          provide: ControllerRef,
          useValue: this,
        },
        provider,
        {
          provide: Logger,
          useFactory: (factory: LoggerFactory) => {
            return factory.create(this.type.name);
          },
          deps: [LoggerFactory],
        },
      ],
      this.type.name
    );
    this.nger.methods.forEach((it) => {
      this.methods.set(it.property, new ControllerMethodRef(it, injector));
    });
    this.nger.methods.forEach((it) => {
      if (it.metadataKey) {
        const handler = this.injector.get<ProxyHandler>(it.metadataKey, null);
        if (handler) {
          handler.method(it, injector);
        }
      }
    });
  }
  get(p: any): ControllerMethodRef<T> | undefined {
    return this.methods.get(p);
  }
}
