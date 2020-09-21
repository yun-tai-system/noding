import {
  createClassDecorator,
  createPropertyDecorator,
  IClassDecorator,
  Type,
} from "@noding/decorator";
export interface PlainOptions {
  desc: string | number | object | (string | number)[];
}
export const PlainMetadataKey = `@noding/plain __PlainMetadataKey__`;
export const Plain = createClassDecorator<PlainOptions>(
  PlainMetadataKey,
  (item: IClassDecorator<any, PlainOptions>) => {
    item.options = {
      desc: item.type.name,
      ...item.options,
    };
  }
);

export interface PlainProOptions {
  isClass?: boolean;
  type?: Type<any>;
}
export const PlainProMetadataKey = `@noding/plain __PlainProMetadataKey__`;
export const PlainPro = createPropertyDecorator<PlainProOptions>(
  PlainProMetadataKey
);

export interface PlainModuleOptions {
  imports: any[];
  providers: any[];
}
export const PlainModuleMetadataKey = `@noding/plain __PlainModuleMetadataKey__`;
export const PlainModule = createClassDecorator<PlainModuleOptions>(
  PlainModuleMetadataKey
);
