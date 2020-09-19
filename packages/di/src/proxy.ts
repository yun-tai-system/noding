import { INgerDecorator } from "@noding/decorator";
import { Injector } from "./injector";
export function createProxyRef<T>(
  nger: INgerDecorator<T, any>,
  controllerInjector: Injector,
  instance: T
) {
  return instance;
}
