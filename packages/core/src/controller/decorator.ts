import {
  createClassDecorator,
  IClassDecorator,
  createMethodDecorator,
  createPropertyDecorator,
  createDecorator,
} from "@noding/decorator";
interface URLSearchParams {
  append(name: string, value: string): void;
  delete(name: string): void;
  entries(): IterableIterator<[string, string]>;
  forEach(
    callback: (value: string, name: string, searchParams: this) => void
  ): void;
  get(name: string): string | null;
  getAll(name: string): string[];
  has(name: string): boolean;
  keys(): IterableIterator<string>;
  set(name: string, value: string): void;
  sort(): void;
  toString(): string;
  values(): IterableIterator<string>;
}
import { InjectionToken, Providers } from "@noding/di";
export const ControllerMetadataKey = `@noding/core ControllerMetadataKey`;
export interface ControllerOptions {
  /**
   * // todo
   * 暂时不生效
   */
  providers?: Providers[];
}
export const Controller = createClassDecorator<ControllerOptions | string>(
  ControllerMetadataKey,
  (item: IClassDecorator<any, ControllerOptions | string>) => {
    if (item.options) {
      if (
        typeof item.options === "string" ||
        item.options instanceof InjectionToken
      ) {
        item.options = {
          providers: [],
        };
      } else {
        item.options = {
          providers: [],
          ...item.options,
        };
      }
    } else {
      item.options = {
        providers: [],
      };
    }
  }
);

export const RunMetadataKey = `@noding/core RUN`;
export const Run = createMethodDecorator(RunMetadataKey);

export const CurrentMetadataKey = `@noding/core CurrentMetadataKey`;
export interface CurrentOptions {
  key: string;
}
export const Current = createDecorator<string | CurrentOptions>(
  CurrentMetadataKey,
  (it: any) => {
    const options = it.options;
    if (typeof options === "string") {
      it.options = {
        key: options,
      };
    }
  }
);

export const IpMetadataKey = `@noding/core IpMetadataKey`;
export const Ip = createPropertyDecorator<{}>(IpMetadataKey);

export interface ArgsOptions {
  key: string;
}
export const ArgsMetadataKey = `@noding/core ArgsMetadataKey`;
export const Args = createDecorator<ArgsOptions | string>(
  ArgsMetadataKey,
  (it: any) => {
    let options = it.options as ArgsOptions;
    if (typeof options === "string") {
      options = {
        key: options,
      };
    }
    it.options = options;
  }
);
export const ARGS = new InjectionToken<any>(`@noding/core ARGS`);

export const UuidMetadataKey = `@noding/typeorm UuidMetadataKey`;
export const Uuid = createPropertyDecorator<any>(UuidMetadataKey);

export const PARAMS = new InjectionToken<any[]>(`noding/core PARAMS`);
export const ParamMetadataKey = `@noding/core ParamsMetadataKey`;
export interface ParamOptions {
  key: string;
}
export const Param = createDecorator<string | ParamOptions>(
  ParamMetadataKey,
  (it: any) => {
    let options = it.options as ArgsOptions;
    if (typeof options === "string") {
      options = {
        key: options,
      };
    }
    it.options = options;
  }
);

export const QueryMetadataKey = "@noding/http QueryMetadatakey";
export interface QueryOptions {
  key: string;
}
export const Query = createDecorator<string | QueryOptions>(
  QueryMetadataKey,
  (it: any) => {
    let options = it.options as ArgsOptions;
    if (typeof options === "string") {
      options = {
        key: options,
      };
    }
    it.options = options;
  }
);

export const QUERY = new InjectionToken<URLSearchParams>(`@noding/core QUERY`);
