import {
  getINgerDecorator,
  IConstructorDecorator,
  INgerDecorator,
  Type,
} from "@noding/decorator";
import {
  InjectMetadataKey,
  OptionalMetadataKey,
  SelfMetadataKey,
  SkipSelfMetadataKey,
  Optional,
  Self,
  SkipSelf,
} from "./decorator";
import {
  isTypeProvider,
  Provider,
  StaticProvider,
  isClassProvider,
} from "./types";
export function providerToStaticProvider(provider: Provider): StaticProvider {
  if (isTypeProvider(provider)) {
    const nger = getINgerDecorator(provider);
    const deps: any[] = getClassInjectDeps(nger);
    return {
      provide: provider,
      useClass: provider,
      deps: deps,
    };
  } else if (isClassProvider(provider)) {
    const nger = getINgerDecorator(provider.useClass);
    let deps: any[] = getClassInjectDeps(nger);
    return {
      provide: provider.provide,
      useClass: provider.useClass,
      multi: provider.multi,
      deps: deps,
      noCache: !!provider.noCache,
    };
  } else {
    return provider;
  }
}
export function getClassInjectDeps(nger: INgerDecorator, deps: any[] = []) {
  const cls = nger.classes.find((ct) => !!ct);
  if (cls) {
    deps = new Array(cls.parameters.length);
    nger.constructors.map((it) => {
      deps[it.parameterIndex] = deps[it.parameterIndex] || [];
      if (it.metadataKey === OptionalMetadataKey) {
        deps[it.parameterIndex].push(new Optional());
      }
      if (it.metadataKey === SelfMetadataKey) {
        deps[it.parameterIndex].push(new Self());
      }
      if (it.metadataKey === SkipSelfMetadataKey) {
        deps[it.parameterIndex].push(new SkipSelf());
      }
      if (it.metadataKey === InjectMetadataKey) {
        let item = it as IConstructorDecorator<any, Type<any>>;
        const options = item.options;
        if (options) {
          deps[it.parameterIndex].push(options);
        }
      }
    });
    cls.parameters.map((it, index) => {
      deps[index] = deps[index] || it;
    });
  }
  return deps;
}
