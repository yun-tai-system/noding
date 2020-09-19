import {
  createClassDecorator,
  IParameterDecorator,
  IConstructorDecorator,
  createDecorator,
  IPropertyDecorator,
  Type
} from "@noding/decorator";
import { IToken } from "./types";
export const InjectableMetadataKey = `InjectableMetadataKey`;
export interface InjectableOptions {
  providedIn?: Type<any> | "root" | "platform" | "any" | null | string;
  factory?: Function;
  deps?: any[];
}
export const Injectable = createClassDecorator<InjectableOptions>(
  InjectableMetadataKey
);
export const InjectMetadataKey = `InjectMetadataKey`;
export const Inject = createDecorator<IToken<any>, IToken<any>>(
  InjectMetadataKey,
  (item: any) => {
    if (item.options) {
      return;
    } else if (item instanceof IPropertyDecorator) {
      item.options = item.propertyType;
    } else if (item instanceof IParameterDecorator) {
      item.options = item.parameterType;
    } else if (item instanceof IConstructorDecorator) {
      item.options = item.parameterType;
    } else {
      throw new Error(`can not support @Inject type`);
    }
  }
);

export const OptionalMetadataKey = `OptionalMetadataKey`;
export interface OptionalOptions {}
export const Optional = createDecorator<OptionalOptions>(OptionalMetadataKey);

export const SelfMetadataKey = `SelfMetadataKey`;
export interface SelfOptions {}
export const Self = createDecorator<SelfOptions>(SelfMetadataKey);

export const SkipSelfMetadataKey = `SkipSelfMetadataKey`;
export interface SkipSelfOptions {}
export const SkipSelf = createDecorator<SkipSelfOptions>(SkipSelfMetadataKey);

export const HostMetadataKey = `HostMetadataKey`;
export interface HostOptions {}
export const Host = createDecorator<HostOptions>(HostMetadataKey);
