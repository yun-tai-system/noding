import { Injector } from "./injector";
let _currentInjector: Injector | undefined | null = undefined;
export function setCurrentInjector(
  injector: Injector | null | undefined
): Injector | undefined | null {
  const former = _currentInjector;
  _currentInjector = injector;
  return former;
}
export function getCurrentInjector(): Injector | undefined | null {
  return _currentInjector;
}
export function setDefaultInjector(injector: Injector) {
  _currentInjector = injector;
}
