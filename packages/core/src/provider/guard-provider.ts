import {
  createDecorator,
  IClassDecorator,
  IMethodDecorator,
  isType,
  Type,
} from "@noding/decorator";
import {
  GET_INGER_DECORATOR,
  Injector,
  ProxyHandler,
  StaticProvider,
} from "@noding/di";
import { CanActivate } from "../lifecycle";
export const UseGuardMetadataKey = "@noding/core UseGuardMetadataKey";
export const UseGuard = createDecorator<Type<CanActivate> | CanActivate>(
  UseGuardMetadataKey
);
export const guardMap: Map<Type<any>, Map<any, CanActivate[]>> = new Map();
export const useGuardProvider: StaticProvider = {
  provide: UseGuardMetadataKey,
  useFactory: () => {
    return new ProxyHandler({
      class: (cls: IClassDecorator<any, any>, injector: Injector) => {
        const map = guardMap.get(cls.type) || new Map();
        if (cls.options) {
          const getDecorator = injector.get(GET_INGER_DECORATOR);
          const nger = getDecorator(cls.type);
          const guard = isType(cls.options)
            ? injector.get(cls.options)
            : cls.options;
          nger.methods.forEach((it) => {
            const key = it.property;
            const guards: CanActivate[] = map.get(key) || [];
            if (!guards.includes(guard)) {
              guards.push(guard);
            }
            map.set(key, guards);
          });
          guardMap.set(cls.type, map);
        }
      },
      method: (it: IMethodDecorator<any, any>, injector: Injector) => {
        const map = guardMap.get(it.type) || new Map();
        if (it.options) {
          const guard = isType(it.options)
            ? injector.get(it.options)
            : it.options;
          const key = it.property;
          const guards: CanActivate[] = map.get(key) || [];
          if (!guards.includes(guard)) {
            guards.push(guard);
          }
          map.set(key, guards);
          guardMap.set(it.type, map);
        }
      },
    });
  },
};
