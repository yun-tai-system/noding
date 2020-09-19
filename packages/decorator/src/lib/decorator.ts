import {
  getDesignType,
  getDesignParamTypes,
  getDesignReturnType,
  getDesignTargetParams,
} from "./util";
import { clsStore } from "./decoratorStore";
import { Type } from "./types";
const nger = Symbol.for(`__nger__decorator__`);
export type TypeProperty = string | symbol;
export type CallHanlder<O> =
  | ClassHanlder<O>
  | PropertyHandler<O>
  | MethodHandler<O>
  | ParameterHandler<O>;
// tslint:disable-next-line: variable-name
let _globalAfterHandlers: Map<string, CallHanlder<any>> = new Map();
// tslint:disable-next-line: variable-name
let _globalBeforeHandlers: Map<string, CallHanlder<any>> = new Map();
// tslint:disable-next-line: typedef
export function setGlobalBeforeHandlers(
  handlers: Map<string, CallHanlder<any>>
) {
  _globalBeforeHandlers = handlers;
}
// tslint:disable-next-line: typedef
export function setGlobalAfterHandlers(
  handlers: Map<string, CallHanlder<any>>
) {
  _globalAfterHandlers = handlers;
}
// tslint:disable-next-line: typedef
export function getGlobalBeforeHanderAndCall(key: string, item: any) {
  const handler = _globalBeforeHandlers.get(key);
  if (handler) {
    handler(item);
  }
}
// tslint:disable-next-line: typedef
export function getGlobalAfterHanderAndCall(key: string, item: any) {
  const handler = _globalAfterHandlers.get(key);
  if (handler) {
    handler(item);
  }
}
export type ClassOptions<T, O> = (target: Type<T>) => O;
export type PropertyOptions<T, O> = (
  target: Type<T>,
  instance: T,
  property: TypeProperty,
  propertyType: any
) => O;
export type ParameterOptions<T, O> = (
  target: Type<T>,
  instance: T,
  property: TypeProperty | undefined,
  parameterIndex: number
) => O;
export type MethodOptions<T, O> = (
  target: Type<T>,
  instance: T,
  property: TypeProperty,
  descriptor: TypedPropertyDescriptor<any>
) => O;
export class INgerDecorator<T = any, O = any> {
  readonly type: Type<T>;
  private _classes: Set<IClassDecorator> = new Set();
  private _properties: Set<IPropertyDecorator> = new Set();
  private _constructors: Set<IConstructorDecorator> = new Set();
  private _methods: Set<IMethodDecorator> = new Set();
  // tslint:disable-next-line: typedef
  get classes() {
    return [...this._classes];
  }
  // tslint:disable-next-line: typedef
  get methods() {
    return [...this._methods];
  }
  // tslint:disable-next-line: typedef
  get properties() {
    return [...this._properties];
  }
  // tslint:disable-next-line: typedef
  get constructors() {
    return [...this._constructors];
  }
  constructor(type: Type<T>) {
    this.type = type;
  }
  addClass(item: IClassDecorator) {
    this._classes.add(item);
  }
  addProperty(item: IPropertyDecorator) {
    this._properties.add(item);
  }
  addConstructor(item: IConstructorDecorator) {
    this._constructors.add(item);
  }
  addMethod(item: IMethodDecorator) {
    const methods = this.__getMethod(
      item.property,
      item.instance,
      item.type,
      item.metadataKey
    );
    const parameters = this.getParameters(item.property);
    methods.map((method) => {
      parameters.map((it) => {
        method.addParameter(it);
      });
      method.setDescriptor(item.descriptor);
      method.setReturnType(item.returnType);
      method.setParamTypes(item.paramTypes);
      method.setOptions(item.options);
      method.setMetadataKey(item.metadataKey);
    });
  }
  private getParameters(name: any) {
    const method = [...this._methods].find((method) => {
      if (method.property === name) {
        return true;
      }
      return false;
    });
    if (method) {
      return method.parameters;
    }
    return [];
  }
  addMethodParameter(item: IParameterDecorator) {
    const methods = this.__getMethod(item.property, item.instance, item.type);
    return methods.map((method) => method.addParameter(item));
  }
  private __getMethod(
    property: TypeProperty,
    instance: T,
    type: Type<T>,
    metadataKey?: string
  ): IMethodDecorator[] {
    const method = [...this._methods].filter((it) => {
      if (metadataKey && it.metadataKey) {
        return it.property === property && it.metadataKey === metadataKey;
      }
      return it.property === property;
    });
    if (method.length > 0) {
      return method;
    }
    let _method = new IMethodDecorator(
      property,
      instance,
      type,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    );
    this._methods.add(_method);
    return [_method];
  }
}
export class IClassDecorator<T = any, O = any> {
  private _type: Type<T>;
  private _options: O | undefined;
  private _metadataKey: string;
  private _params: any[];
  args: any[] = [];
  get options(): O | undefined {
    return this._options;
  }
  set options(o: O | undefined) {
    this._options = o;
  }
  get type() {
    return this._type;
  }
  get metadataKey() {
    return this._metadataKey;
  }
  get parameters() {
    return this._params;
  }
  constructor(type: Type<T>, options: O, metadataKey: string, params: any) {
    this._type = type;
    this._options = options;
    this._metadataKey = metadataKey;
    this._params = params;
  }
}
export class IConstructorDecorator<T = any, O = any> {
  private _type: Type<T>;
  private _options: O | undefined;
  private _parameterIndex: number;
  private _parameterTypes: any[];
  private _parameterType: any;
  args: any[] = [];
  get type() {
    return this._type;
  }
  get options(): O | undefined {
    return this._options;
  }
  set options(o: O | undefined) {
    this._options = o;
  }
  get parameterIndex() {
    return this._parameterIndex;
  }
  get parameterType() {
    return this._parameterType || this._parameterTypes[this.parameterIndex];
  }
  private _metadataKey: string;
  get metadataKey() {
    return this._metadataKey;
  }
  constructor(
    type: Type<T>,
    parameterIndex: number,
    options: O,
    parameterTypes: any[],
    metadataKey: string
  ) {
    this._type = type;
    this._parameterIndex = parameterIndex;
    this._options = options;
    this._parameterTypes = parameterTypes;
    this._metadataKey = metadataKey;
  }
  setParamterType(type: any) {
    this._parameterType = type;
  }
}
export class IParameterDecorator<T = any, O = any> {
  args: any[] = [];
  private _instance: T;
  private _type: Type<T>;
  private _property: string | symbol;
  private _parameterIndex: number;
  private _options: O | undefined;
  private _parameterTypes: any[];
  get instance() {
    return this._instance;
  }
  get type() {
    return this._type;
  }
  get property() {
    return this._property;
  }
  get parameterIndex() {
    return this._parameterIndex;
  }
  get options(): O | undefined {
    return this._options;
  }
  set options(o: O | undefined) {
    this._options = o;
  }
  get parameterType() {
    return this._parameterTypes[this.parameterIndex];
  }
  private _metadataKey: string;
  get metadataKey() {
    return this._metadataKey;
  }
  constructor(
    instance: T,
    type: Type<T>,
    property: TypeProperty,
    parameterIndex: number,
    options: O,
    parameterTypes: any[],
    metadataKey: string
  ) {
    this._instance = instance;
    this._type = type;
    this._property = property;
    this._parameterIndex = parameterIndex;
    this._options = options;
    this._parameterTypes = parameterTypes;
    this._metadataKey = metadataKey;
  }
}
export class IPropertyDecorator<T = any, O = any> {
  args: any[] = [];
  private _property: string | symbol;
  private _instance: T;
  private _type: Type<T>;
  private _options: O | undefined;
  private _propertyType: any;
  get property() {
    return this._property;
  }
  get instance() {
    return this._instance;
  }
  get type() {
    return this._type;
  }
  get options(): O | undefined {
    return this._options;
  }
  set options(o: O | undefined) {
    this._options = o;
  }
  get propertyType() {
    return this._propertyType;
  }
  private _metadataKey: string | undefined;
  get metadataKey() {
    return this._metadataKey;
  }
  constructor(
    property: TypeProperty,
    instance: T,
    type: Type<T>,
    options?: O,
    propertyType?: any,
    metadataKey?: string
  ) {
    this._property = property;
    this._instance = instance;
    this._type = type;
    this._options = options;
    this._propertyType = propertyType;
    this._metadataKey = metadataKey;
  }
}
export class IMethodDecorator<T = any, O = any> {
  args: any[] = [];
  private _property: TypeProperty;
  private _instance: T;
  private _type: Type<T>;
  private _descriptor: TypedPropertyDescriptor<any> | undefined;
  private _options: O | undefined;
  private _parameters: Set<IParameterDecorator> = new Set();
  private _returnType: any;
  private _paramTypes: any[];
  get returnType() {
    return this._returnType;
  }
  get paramTypes() {
    return this._paramTypes || [];
  }
  get parameters() {
    return [...this._parameters];
  }
  get options(): O | undefined {
    return this._options;
  }
  set options(o: O | undefined) {
    this._options = o;
  }
  get descriptor() {
    return this._descriptor;
  }
  get type() {
    return this._type;
  }
  get instance() {
    return this._instance;
  }
  get property() {
    return this._property;
  }
  private _metadataKey: string | undefined;
  get metadataKey() {
    return this._metadataKey;
  }
  constructor(
    property: string | symbol,
    instance: T,
    type: Type<T>,
    descriptor: TypedPropertyDescriptor<any> | undefined,
    options: O,
    returnType: any,
    paramTypes: any,
    metadataKey: string | undefined
  ) {
    this._property = property;
    this._instance = instance;
    this._type = type;
    this._descriptor = descriptor;
    this._metadataKey = metadataKey;
    this._options = options;
    this._returnType = returnType;
    this._paramTypes = paramTypes;
  }

  setDescriptor(descriptor: TypedPropertyDescriptor<any> | undefined) {
    this._descriptor = descriptor;
  }

  setReturnType(returnType: any) {
    this._returnType = returnType;
  }

  setParamTypes(paramTypes: any[]) {
    this._paramTypes = paramTypes;
  }

  setOptions(options: O) {
    this._options = options;
  }

  setMetadataKey(key: string | undefined) {
    this._metadataKey = key;
  }

  addParameter(item: IParameterDecorator) {
    this._parameters.add(item);
  }
}
export function getINgerDecorator<T = any, O = any>(
  type: Type<T>
): INgerDecorator<T, O> {
  if (!type) {
    throw new Error(`get nger decorator error`);
  }
  if (!Reflect.has(type, nger)) {
    const value = new INgerDecorator(type);
    Reflect.defineProperty(type, nger, {
      value,
    });
  }
  return Reflect.get(type, nger);
}
export type ParameterHandler<O = any> = (
  arg: IConstructorDecorator<any, O> | IParameterDecorator<any, O>
) => void;
export interface NgerDecorator<O = any> {
  options?: O;
  ngMetadataName: string;
}
export interface NgerParameterDecorator<O, T> {
  (opt?: O): ParameterDecorator;
  new (arg?: T): NgerDecorator<T>;
}
export function createParameterDecorator<O = any, T extends O = O>(
  metadataKey: string,
  beforeHandler?: ParameterHandler<O>,
  afterHandler?: ParameterHandler<O>
): NgerParameterDecorator<O, T> {
  function DecoratorFactory(this: any, opts?: O): ParameterDecorator {
    if (this instanceof DecoratorFactory) {
      (this as NgerDecorator<T>).options = opts as T;
      return this as any;
    }
    function Decorator(
      target: any,
      property: TypeProperty | undefined,
      parameterIndex: number
    ) {
      let parameterTypes = [];
      if (property) {
        parameterTypes = getDesignParamTypes(target, property) || [];
      } else {
        parameterTypes = getDesignTargetParams(target) || [];
      }
      // 如果property=undefined,说明是constructor,target是Class
      // 否则property是方法名, target是Class的instance
      let type = target.constructor;
      const instance = target;
      if (!property) {
        type = target;
      }
      const options: any = opts;
      const classDecorator = getINgerDecorator(type);
      if (!property) {
        const item = new IConstructorDecorator(
          type,
          parameterIndex,
          options,
          parameterTypes,
          metadataKey
        );
        item.args = [target, property, parameterIndex];
        if (beforeHandler) {
          beforeHandler(item);
        }
        getGlobalBeforeHanderAndCall(metadataKey, item);
        classDecorator.addConstructor(item);
        if (afterHandler) {
          afterHandler(item);
        }
        getGlobalAfterHanderAndCall(metadataKey, item);
      } else {
        const item = new IParameterDecorator(
          instance,
          type,
          property,
          parameterIndex,
          options,
          parameterTypes,
          metadataKey
        );
        item.args = [target, property, parameterIndex];
        beforeHandler && beforeHandler(item);
        getGlobalBeforeHanderAndCall(metadataKey, item);
        classDecorator.addMethodParameter(item);
        afterHandler && afterHandler(item);
        getGlobalAfterHanderAndCall(metadataKey, item);
      }
    }
    return Decorator;
  }
  DecoratorFactory.prototype.ngMetadataName = metadataKey;
  return DecoratorFactory as any;
}
export type PropertyHandler<O = any> = (
  item: IPropertyDecorator<any, O>
) => void;
export interface NgerPropertyDecorator<O, T> {
  (opt?: O): PropertyDecorator;
  new (arg?: T): NgerDecorator<T>;
}
export function createPropertyDecorator<O = any, T extends O = O>(
  metadataKey: string,
  beforeHandler?: PropertyHandler<O>,
  afterHandler?: PropertyHandler
): NgerPropertyDecorator<O, T> {
  function DecoratorFactory(this: any, opts?: O): PropertyDecorator {
    if (this instanceof DecoratorFactory) {
      (this as NgerDecorator<T>).options = opts as T;
      return this as any;
    }
    function Decorator(target: any, property: TypeProperty) {
      const propertyType = getDesignType(target, property);
      const type = target.constructor;
      const instance = target;
      const classDecorator = getINgerDecorator(type);
      const item = new IPropertyDecorator<any, O>(
        property,
        instance,
        type,
        opts,
        propertyType,
        metadataKey
      );
      item.args = [target, property];
      beforeHandler && beforeHandler(item);
      getGlobalBeforeHanderAndCall(metadataKey, item);
      classDecorator.addProperty(item);
      afterHandler && afterHandler(item);
      getGlobalAfterHanderAndCall(metadataKey, item);
    }
    return Decorator;
  }
  DecoratorFactory.prototype.ngMetadataName = metadataKey;
  return DecoratorFactory as any;
}
export type MethodHandler<O = any> = (item: IMethodDecorator<any, O>) => void;
export interface NgerMethodDecorator<O, T> {
  (opt?: O): MethodDecorator;
  new (arg?: T): NgerDecorator<T>;
}
export function createMethodDecorator<O = any, T extends O = O>(
  metadataKey: string,
  beforeHandler?: MethodHandler<O>,
  afterHandler?: MethodHandler<O>
): NgerMethodDecorator<O, T> {
  function DecoratorFactory(this: any, opts?: O): MethodDecorator {
    if (this instanceof DecoratorFactory) {
      (this as NgerDecorator<T>).options = opts as T;
      return this as any;
    }
    function Decorator(
      target: any,
      property: TypeProperty,
      descriptor: TypedPropertyDescriptor<any>
    ) {
      const returnType = getDesignReturnType(target, property);
      const paramTypes = getDesignParamTypes(target, property) || [];
      const type = target.constructor;
      const instance = target;
      const options: any = opts;
      const classDecorator = getINgerDecorator(type);
      const item = new IMethodDecorator(
        property,
        instance,
        type,
        descriptor,
        options,
        returnType,
        paramTypes,
        metadataKey
      );
      item.args = [target, property, descriptor];
      beforeHandler && beforeHandler(item);
      getGlobalBeforeHanderAndCall(metadataKey, item);
      classDecorator.addMethod(item);
      afterHandler && afterHandler(item);
      getGlobalAfterHanderAndCall(metadataKey, item);
    }
    return Decorator;
  }
  DecoratorFactory.prototype.ngMetadataName = metadataKey;
  return DecoratorFactory as any;
}
export type ClassHanlder<O = any> = (item: IClassDecorator<any, O>) => void;
export interface NgerClassDecorator<O, T> {
  (opt?: O): ClassDecorator;
  new (arg?: T): NgerDecorator<T>;
}
export function createClassDecorator<O = any, T extends O = O>(
  metadataKey: string,
  beforeHandler?: ClassHanlder<O>,
  afterHandler?: ClassHanlder<O>
): NgerClassDecorator<O, T> {
  function DecoratorFactory(this: any, opts?: O): ClassDecorator {
    if (this instanceof DecoratorFactory) {
      (this as NgerDecorator<T>).options = opts as T;
      return this as any;
    }
    function Decorator(target: any) {
      const type = target;
      const options: any = opts;
      const params = getDesignTargetParams(target) || [];
      const classDecorator = getINgerDecorator(type);
      const item = new IClassDecorator(type, options, metadataKey, params);
      item.args = [target];
      beforeHandler && beforeHandler(item);
      // before 钩子
      getGlobalBeforeHanderAndCall(metadataKey, item);
      classDecorator.addClass(item);
      clsStore.set(metadataKey, type);
      afterHandler && afterHandler(item);
      getGlobalAfterHanderAndCall(metadataKey, item);
    }
    return Decorator;
  }
  DecoratorFactory.prototype.ngMetadataName = metadataKey;
  return DecoratorFactory as any;
}
export interface Decorator<O, T> {
  (opts?: O): (target: any, property?: any, descriptor?: any) => any;
  new (opts?: T): NgerDecorator<T>;
}
export function createDecorator<O = any, T extends O = O>(
  metadataKey: string,
  beforeHandler?: CallHanlder<O>,
  afterHandler?: CallHanlder<O>
): Decorator<O, T> {
  function DecoratorFactory(
    this: any,
    opt?: O
  ): (target: any, property?: any, descriptor?: any) => any {
    if (this instanceof DecoratorFactory) {
      (this as NgerDecorator<T>).options = opt as T;
      return this as any;
    }
    function Decorator(target: any, property?: any, descriptor?: any) {
      if (property) {
        if (typeof descriptor === "undefined") {
          return createPropertyDecorator(
            metadataKey,
            beforeHandler as any,
            afterHandler as any
          )(opt)(target, property);
        } else if (typeof descriptor === "number") {
          return createParameterDecorator(
            metadataKey,
            beforeHandler as any,
            afterHandler as any
          )(opt)(target, property, descriptor);
        } else {
          return createMethodDecorator(
            metadataKey,
            beforeHandler as any,
            afterHandler as any
          )(opt)(target, property, descriptor);
        }
      } else {
        if (typeof descriptor === "number") {
          return createParameterDecorator(
            metadataKey,
            beforeHandler as any,
            afterHandler as any
          )(opt)(target, property, descriptor);
        }
        return createClassDecorator(
          metadataKey,
          beforeHandler as any,
          afterHandler as any
        )(opt)(target);
      }
    }
    return Decorator;
  }
  DecoratorFactory.prototype.ngMetadataName = metadataKey;
  return DecoratorFactory as any;
}
