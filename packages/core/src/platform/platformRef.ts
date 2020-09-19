import { Injector, ProxyHandler, InjectFlags } from "@noding/di";
import { isOnInit } from "../lifecycle";
import { Type } from "@noding/decorator";
import {
  PLATFORM_INITIALIZER,
  APP_INITIALIZER,
  APP_ANALYSIS,
  ORM_INITIALIZER,
  CACHE_INITIALIZER,
  MQ_INITIALIZER,
  SEARCH_INITIALIZER,
  LAZY_INITIALIZER,
  OTHER_INITIALIZER,
  APP_INSTALL,
  PLATFORM_ANALYSIS,
  CLI_INITIALIZER,
  LAZY_MODULES,
} from "./tokens";
import { NgModuleRef } from "../module/moduleRef";
import { PlainModuleRef, createPlainModule } from "@noding/plain";
import { LOGGER_CONTEXT, LOGGER_METHOD } from "../logger";
import { getINgerDecorator } from "@noding/decorator";
import { ModuleMetadataKey } from "../module/decorator";

export class PlatformRef {
  private _destroyed: boolean = false;
  private _injectorCache: Map<Type<any>, Injector> = new Map();
  get destroyed() {
    return this._destroyed;
  }
  get injector() {
    return this._injector;
  }
  constructor(private _injector: Injector) {}
  addInjector(type: Type<any>, injector: Injector) {
    this._injectorCache.set(type, injector);
  }
  get(type: Type<any>) {
    return this._injectorCache.get(type);
  }
  private moduleToInjector(type: Type<any>, root: Injector) {
    const nger = getINgerDecorator(type);
    const module = nger.classes.find(
      (it) => it.metadataKey === ModuleMetadataKey
    );
    if (module) {
      const handler = this.injector.get<ProxyHandler>(module.metadataKey);
      if (handler) {
        const result = handler.class(module, root);
        const handlers = result.handlers.sort((a: any, b: any) => {
          return a.index - b.index;
        });
        const controllers = handlers.filter(
          (it: any) => it.type === "controllers"
        );
        const providers = handlers.filter((it: any) => it.type === "providers");
        providers.map((it: any) => it.handle());
        controllers.map((it: any) => it.handle());
        return result.injector;
      }
    }
    return root;
  }
  async bootstrapModule<T>(type: Type<T>) {
    let root = this.injector.create(
      [
        {
          provide: PlainModuleRef,
          useFactory: () => {
            return createPlainModule(type);
          },
        },
        {
          provide: PlatformRef,
          useValue: this,
        },
        {
          provide: LOGGER_CONTEXT,
          useValue: "PlatformRef",
        },
        {
          provide: LOGGER_METHOD,
          useValue: "bootstrapModule",
        },
      ],
      "root"
    );
    let moduleInjector: Injector = this.moduleToInjector(type, root);
    
    /**
     * 平台初始化
     */
    const subModules = [this.injector, root, ...this._injectorCache.values()];
    /**
     * 数据库初始化
     */
    await Promise.all(
      subModules.map((it) => {
        const ormInits = it.get(ORM_INITIALIZER, [], InjectFlags.Self);
        return Promise.all(ormInits.map((init) => init(it)));
      })
    );
    await Promise.all(
      subModules.map((it) => {
        const platformInits = this.injector.get(
          PLATFORM_INITIALIZER,
          [],
          InjectFlags.Self
        );
        return Promise.all(platformInits.map((init) => init(it)));
      })
    );
    /**
     * 模块懒加载数据库初始化
     */
    await Promise.all(
      subModules.map((it) => {
        const lazyInits = it.get(LAZY_INITIALIZER, [], InjectFlags.Self);
        return Promise.all(lazyInits.map((init) => init(it)));
      })
    );
    
    /**
     * 模块懒加载
     */
    const lazyModules = await moduleInjector.get(
      LAZY_MODULES,
      Promise.resolve([])
    );
    await Promise.all(
      lazyModules.map((it) => {
        const res = require(it.path);
        const type = res[it.export];
        this.moduleToInjector(type, moduleInjector);
      })
    );
    /**
     * 系统安装
     */
    await Promise.all(
      subModules.map((it) => {
        const appInstall = it.get(APP_INSTALL, [], InjectFlags.Self);
        return Promise.all(appInstall.map((init) => init(it)));
      })
    );
    
    /**
     * 缓存初始化
     */
    await Promise.all(
      subModules.map((it) => {
        const cacheInits = it.get(CACHE_INITIALIZER, [], InjectFlags.Self);
        return Promise.all(cacheInits.map((init) => init(it)));
      })
    );
    /**
     * MQ初始化
     */
    await Promise.all(
      subModules.map((it) => {
        const mqInits = it.get(MQ_INITIALIZER, [], InjectFlags.Self);
        return Promise.all(mqInits.map((init) => init(it)));
      })
    );
    /**
     * 搜索初始化
     */
    await Promise.all(
      subModules.map((it) => {
        const searchInits = it.get(SEARCH_INITIALIZER, [], InjectFlags.Self);
        return Promise.all(searchInits.map((init) => init(it)));
      })
    );

    /**
     * platform 解析
     */
    await Promise.all(
      subModules.map((it) => {
        const platformAnalysis = it.get(
          PLATFORM_ANALYSIS,
          [],
          InjectFlags.Self
        );
        return Promise.all(platformAnalysis.map((init) => init(it)));
      })
    );
    /**
     * app 解析
     */
    await Promise.all(
      subModules.map((it) => {
        const appAnalysis = it.get(APP_ANALYSIS, [], InjectFlags.Self);
        return Promise.all(appAnalysis.map((init) => init(it)));
      })
    );

    /**
     * 系统初始化
     */
    await Promise.all(
      subModules.map((it) => {
        const appInits = it.get(APP_INITIALIZER, [], InjectFlags.Self);
        return Promise.all(appInits.map((init) => init(it)));
      })
    );
    /**
     * other 初始化
     */
    await Promise.all(
      subModules.map((it) => {
        const otherInits = it.get(OTHER_INITIALIZER, [], InjectFlags.Self);
        return Promise.all(otherInits.map((init) => init(it)));
      })
    );
    await Promise.all(
      subModules.map((it) => {
        const cliInits = it.get(CLI_INITIALIZER, [], InjectFlags.Self);
        return Promise.all(cliInits.map((init) => init(it)));
      })
    );
    const ref = moduleInjector!.get(NgModuleRef);
    if (isOnInit(ref)) {
      await ref.onInit();
    }
    return ref;
  }
}
