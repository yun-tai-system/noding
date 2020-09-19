import { Provider, IToken, TScope } from "./types";
export abstract class Injector {
  scope: TScope = null;
  parent: Injector | undefined = undefined;
  /**
   * 获取
   * @param token
   * @param notFoundValue
   * @param flags
   */
  abstract get<T>(
    token: IToken<T>,
    notFoundValue?: T | undefined | null,
    flags?: number
  ): T;
  /**
   * 创建下级injector
   * @param records
   * @param source
   */
  abstract create(records: Provider[], source?: string): Injector;
  /**
   * 查找上级Injector
   * @param scope 上级的作用域
   */
  abstract getInjector(scope: TScope): Injector | undefined;
}
import {
  IPropertyDecorator,
  IParameterDecorator,
  IMethodDecorator,
  IClassDecorator,
  IConstructorDecorator,
} from "@noding/decorator";
export interface ProxyMethodHandler<T, O> {
  (method: IMethodDecorator<T, O>, injector: Injector): any;
}
export interface ProxyPropertyHandler<T, O> {
  (property: IPropertyDecorator<T, O>, injector: Injector, instance?: any): any;
}
export interface ProxyClassHandler<T, O> {
  (cls: IClassDecorator<T, O>, injector: Injector): any;
}
/**
 * todo
 * parameters to old value
 */
export interface ProxyMethodParamsHandler<T, O> {
  (
    parameters: Array<any>,
    parameter: IParameterDecorator<T, O>,
    injector: Injector
  ): any;
}
export interface ProxyConstructorHandler<T, O> {
  (
    parameters: Array<any>,
    constructor: IConstructorDecorator<T, O>,
    injector: Injector
  ): any;
}
/**
 * 所有的集合
 */
export interface IProxyHandler<T = any, O = any> {
  /**
   * 类装饰器处理器
   */
  class?: ProxyClassHandler<T, O>;
  /**
   * 属性装饰器处理器
   */
  property?: ProxyPropertyHandler<T, O>;
  /**
   * 参数装饰器处理器
   */
  methodParams?: ProxyMethodParamsHandler<T, O>;
  /**
   * 方法装饰器处理器
   */
  method?: ProxyMethodHandler<T, O>;
  ctor?: ProxyConstructorHandler<T, O>;
}
export class ProxyHandler<T = any, O = any> {
  constructor(private handler: IProxyHandler<T, O>) {}
  class(cls: IClassDecorator<T, O>, injector: Injector) {
    if (this.handler.class) {
      return this.handler.class(cls, injector);
    } else {
      throw new Error(`${cls.metadataKey} can not use on class`);
    }
  }
  property(
    property: IPropertyDecorator<T, O>,
    injector: Injector,
    instance?: any
  ) {
    if (this.handler.property) {
      return this.handler.property(property, injector, instance);
    } else {
      throw new Error(`${property.metadataKey} can not use on property`);
    }
  }
  method(method: IMethodDecorator<T, O>, injector: Injector) {
    if (this.handler.method) {
      return this.handler.method(method, injector);
    } else {
      throw new Error(`${method.metadataKey} can not use on method`);
    }
  }
  methodParams(
    val: any,
    parameter: IParameterDecorator<T, O>,
    injector: Injector
  ) {
    if (this.handler.methodParams) {
      return this.handler.methodParams(val, parameter, injector);
    } else {
      throw new Error(`${parameter.metadataKey} can not use on method params`);
    }
  }
  ctor(
    parameters: Array<any>,
    constructor: IConstructorDecorator<T, O>,
    injector: Injector
  ) {
    if (this.handler.ctor) {
      return this.handler.ctor(parameters, constructor, injector);
    } else {
      throw new Error(
        `${constructor.metadataKey} can not use on constructor params`
      );
    }
  }
  call(...args: any[]) {
    return callProxyHandler(this.handler, ...args);
  }
}
export function callProxyHandler<T, O>(
  handler: IProxyHandler<T, O>,
  ...args: any[]
) {
  if (args.length === 2) {
    const [a, b] = args;
    if (a instanceof IMethodDecorator) {
      if (handler.method) {
        return handler.method(a, b);
      } else {
        throw new Error(`${a.metadataKey} can not use on method`);
      }
    }
    if (a instanceof IPropertyDecorator) {
      if (handler.property) {
        return handler.property(a, b);
      } else {
        throw new Error(`${a.metadataKey} can not use on property`);
      }
    }
    if (a instanceof IClassDecorator) {
      if (handler.class) {
        return handler.class(a, b);
      } else {
        throw new Error(`${a.metadataKey} can not use on class`);
      }
    }
  } else if (args.length === 3) {
    const [a, b, c] = args;
    if (b instanceof IConstructorDecorator) {
      if (handler.ctor) {
        return handler.ctor(a, b, c);
      } else {
        throw new Error(`${a.metadataKey} can not use on constructor params`);
      }
    }
    if (b instanceof IParameterDecorator) {
      if (handler.methodParams) {
        return handler.methodParams(a, b, c);
      } else {
        throw new Error(`${b.metadataKey} can not use on method params`);
      }
    }
  }
  throw new Error(`callProxyHandler length or type error`);
}
/**
 * 处理参数钩子
 */
export interface ProxyInterceptorBefore {
  (injector: Injector): any[];
}
/**
 * 处理结果钩子
 */
export interface ProxyInterceptorAfter {
  (injector: Injector): any;
}
