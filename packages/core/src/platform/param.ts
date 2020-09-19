import { IParameterDecorator, IPropertyDecorator } from "@noding/decorator";
import { Injector, ProxyHandler, StaticProvider } from "@noding/di";
import { ParamMetadataKey, PARAMS, ParamOptions } from "../controller";
export const paramProvider: StaticProvider = {
  provide: ParamMetadataKey,
  useFactory: () => {
    return new ProxyHandler({
      methodParams: (
        parameters: Array<any>,
        parameter: IParameterDecorator<any, ParamOptions>,
        injector: Injector
      ) => {
        const options = parameter.options;
        const params = injector.get(PARAMS, []);
        if (options) {
          const param = params.find((it) => it.key === options.key);
          if (param) {
            return param.value;
          }
          return;
        }
        return params;
      },
      property: (
        property: IPropertyDecorator<any, ParamOptions>,
        injector: Injector
      ) => {
        const options = property.options;
        const params = injector.get(PARAMS, []);
        if (options) {
          const param = params.find((it) => it.key === options.key);
          if (param) {
            return param.value;
          }
          return;
        }
        return params;
      },
    });
  },
};
