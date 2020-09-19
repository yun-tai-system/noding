export type Type<T> = new (...args: any[]) => T;
export interface AbstractType<T> extends Function {
  prototype: T;
}
export function isType<T>(val: any): val is Type<T> {
  return typeof val === "function";
}
