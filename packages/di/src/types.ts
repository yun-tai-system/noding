import { Type, AbstractType } from "@noding/decorator";
import { InjectionToken } from "./injectionToken";
export type ITokenString<T> = string & {
  target: T;
};
export type ITokenAny<T> = (
  | number
  | string
  | object
  | Function
  | Array<any>
) & {
  target?: T;
};
export type IToken<T> =
  | Type<T>
  | AbstractType<T>
  | InjectionToken<T>
  | ITokenString<T>
  | ITokenAny<T>;
export interface TypeProvider extends Type<any> {}
export interface BaseProvider {
  provide: any;
  multi?: boolean;
  noCache?: boolean;
}
export interface ValueProvider extends BaseProvider {
  useValue: any;
}
export interface StaticClassProvider extends BaseProvider {
  useClass: Type<any>;
  deps?: any[];
}
export interface ConstructorProvider extends BaseProvider {
  deps?: any[];
}
export interface ExistingProvider extends BaseProvider {
  useExisting: any;
}
export interface FactoryProvider extends BaseProvider {
  useFactory: Function;
  deps?: any[];
}
export type StaticProvider =
  | ValueProvider
  | ExistingProvider
  | StaticClassProvider
  | ConstructorProvider
  | FactoryProvider;
// static 一共5个Provider 谢了4个is函数 剩余的哪一个是ConstructorProvider
export function isValueProvider(val: StaticProvider): val is ValueProvider {
  return val && Reflect.has(val, "useValue");
}
export function isExistingProvider(
  val: StaticProvider
): val is ExistingProvider {
  return val && Reflect.has(val, "useExisting");
}
export function isStaticClassProvider(
  val: StaticProvider
): val is StaticClassProvider {
  return val && Reflect.has(val, "useClass");
}
export function isFactoryProvider(val: StaticProvider): val is FactoryProvider {
  return val && Reflect.has(val, "useFactory");
}
export function isConstructorProvider(
  val: StaticProvider
): val is ConstructorProvider {
  return (
    val &&
    !isValueProvider(val) &&
    !isExistingProvider(val) &&
    !isStaticClassProvider(val) &&
    !isFactoryProvider(val)
  );
}
// ConstructorProvider

export interface ClassProvider extends BaseProvider {
  useClass: Type<any>;
}

// StaticProvider and Provider
// FactoryProvider and FactoryProvider
// ConstructorProvider and ConstructorProvider
// StaticClassProvider and null
// ExistingProvider and ExistingProvider
// ValueProvider and ValueProvider
// null and TypeProvider
// null and ClassProvider
export type Provider =
  | TypeProvider
  | ValueProvider
  | ClassProvider
  | ConstructorProvider
  | ExistingProvider
  | FactoryProvider;
// provider 一共6个
// TypeProvider
export function isTypeProvider(val: any): val is TypeProvider {
  return typeof val === "function";
}
// ClassProvider
export function isClassProvider(val: any): val is ClassProvider {
  return val && Reflect.has(val, "useClass");
}
// TypeProvider 等价于ClassProvider
// [Type] = [{provide: Type,useClass: Type}]

// 将Provider转化为StaticProvider
// TypeProvider|| ClassProvider
// TypeProvider -> StaticClassProvider
// ClassProvider-> StaticClassProvider

/**
 * TypeProvider
 * providers:[
 *  ImsDemo
 * ]
 * ->{
 *      provide: ImsDemo,
 *      useClass: ImsDemo,
 *      deps: any[],
 *      multi: false
 * }
 */

/**
 * ClassProvider
 * providers: [
 *     {
 *         provide: ImsDemo,
 *         useClass: ImsDemo,
 *         multi: false
 *     }
 * ]
 * ->
 * ->{
 *      provide: ImsDemo,
 *      useClass: ImsDemo,
 *      deps: any[], // 只需要生成uerClass相应的deps
 *      multi: false
 * }
 */

export type AllProvider = Provider | StaticProvider;

export interface SchemaMetadata {
  name: string;
}
export type Providers = Provider | Providers[];
export interface ModuleWithProviders<T = any> {
  ngModule: Type<T>;
  providers: Providers[];
}

export enum InjectFlags {
  Default = 0b0000,
  Host = 0b0001,
  Self = 0b0010,
  SkipSelf = 0b0100,
  Optional = 0b1000,
}

export enum OptionFlags {
  Optional = 1 << 0,
  CheckSelf = 1 << 1,
  CheckParent = 1 << 2,
  Default = CheckSelf | CheckParent,
}

export type TScope = "null" | "top" | "platform" | "root" | string | any | null;
