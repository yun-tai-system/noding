import { Type } from "@noding/decorator";
export const NEW_LINE = /\n/gm;
export const NO_NEW_LINE = "ɵ";
export const NG_TOKEN_PATH = "ngTokenPath";
export const NG_TEMP_TOKEN_PATH = "ngTempTokenPath";
export const SOURCE = "__source";
export function stringify(token: any): string {
  if (typeof token === "string") {
    return token;
  }
  if (token instanceof Array) {
    return "[" + token.map(stringify).join(", ") + "]";
  }
  if (token == null) {
    return "" + token;
  }
  if (token.overriddenName) {
    return `${token.overriddenName}`;
  }
  if (token.name) {
    return `${token.name}`;
  }
  const res = token.toString();
  if (res == null) {
    return "" + res;
  }
  const newLineIndex = res.indexOf("\n");
  return newLineIndex === -1 ? res : res.substring(0, newLineIndex);
}

export function getClosureSafeProperty<T>(objWithPropertyToExtract: T): string {
  for (let key in objWithPropertyToExtract) {
    if (objWithPropertyToExtract[key] === (getClosureSafeProperty as any)) {
      return key;
    }
  }
  throw Error("Could not find renamed property on target object.");
}

export function forwardRef(forwardRefFn: ForwardRefFn): Type<any> {
  (<any>forwardRefFn).__forward_ref__ = forwardRef;
  (<any>forwardRefFn).toString = function () {
    return stringify(this());
  };
  return <Type<any>>(<any>forwardRefFn);
}
export interface ForwardRefFn {
  (): any;
}
const __forward_ref__ = getClosureSafeProperty({
  __forward_ref__: getClosureSafeProperty,
});

export function resolveForwardRef<T>(type: T): T {
  const fn: any = type;
  if (
    typeof fn === "function" &&
    fn.hasOwnProperty(__forward_ref__) &&
    fn.__forward_ref__ === forwardRef
  ) {
    return fn();
  } else {
    return type;
  }
}

export function catchInjectorError(
  e: any,
  token: any,
  injectorErrorName: string,
  source: string | null
): never {
  const tokenPath: any[] = e[NG_TEMP_TOKEN_PATH];
  if (token) {
    if (token[SOURCE]) {
      tokenPath.unshift(token[SOURCE]);
    }
  }
  e.message = formatError(
    "\n" + e.message,
    tokenPath,
    injectorErrorName,
    source
  );
  e[NG_TOKEN_PATH] = tokenPath;
  e[NG_TEMP_TOKEN_PATH] = null;
  throw e;
}

export function formatError(
  text: string,
  obj: any,
  injectorErrorName: string,
  source: string | null = null
): string {
  text =
    text && text.charAt(0) === "\n" && text.charAt(1) == NO_NEW_LINE
      ? text.substr(2)
      : text;
  let context = stringify(obj);
  if (obj instanceof Array) {
    context = obj.map(stringify).join(" -> ");
  } else if (typeof obj === "object") {
    let parts = <string[]>[];
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        let value = obj[key];
        parts.push(
          key +
            ":" +
            (typeof value === "string"
              ? JSON.stringify(value)
              : stringify(value))
        );
      }
    }
    context = `{${parts.join(", ")}}`;
  }
  return `${injectorErrorName}${
    source ? "(" + source + ")" : ""
  }[${context}]: ${text.replace(NEW_LINE, "\n  ")}`;
}

export function staticError(text: string, obj: any): Error {
  return new Error(formatError(text, obj, "StaticInjectorError"));
}

export function isPromise<T = any>(val: any): val is Promise<T> {
  return typeof val === "object" && Reflect.has(val, "then");
}
