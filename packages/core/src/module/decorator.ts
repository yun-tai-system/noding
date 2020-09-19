import { createClassDecorator, Type } from "@noding/decorator";
import { ModuleWithProviders, Providers } from "@noding/di";

export const ModuleMetadataKey = `ModuleMetadataKey`;
export interface ModuleOptions {
  providers?: Providers[];
  imports?: Array<Type<any> | ModuleWithProviders<any>>;
  controllers?: Type<any>[];
}
export const Module = createClassDecorator<ModuleOptions>(ModuleMetadataKey);
export const NgModule = Module;
