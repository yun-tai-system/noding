import { Injector, Provider, ProxyHandler } from "@noding/di";
import { IParameterDecorator, IPropertyDecorator } from "@noding/decorator";
import { QueryMetadataKey, QueryOptions, QUERY } from "../controller";
export const queryProvider: Provider = {
  provide: QueryMetadataKey,
  useFactory: () => {
    return new ProxyHandler({
      methodParams: (
        parameters: Array<any>,
        parameter: IParameterDecorator<any, QueryOptions>,
        injector: Injector
      ) => {
        const options = parameter.options;
        const query = injector.get(QUERY, null);
        if (options) {
          if (query) {
            return query.get(options.key);
          }
          return;
        }
        return query;
      },
      property: (
        property: IPropertyDecorator<any, QueryOptions>,
        injector: Injector
      ) => {
        const options = property.options;
        const query = injector.get(QUERY, null);
        if (options) {
          if (query) {
            return query.get(options.key);
          }
          return;
        }
        return query;
      },
    });
  },
};
