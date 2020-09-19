import { Injector, Type } from "@noding/di";
import { PlatformRef } from "../platform/platformRef";
import { ControllerRef } from "./controller.ref";
export class NgModuleRef<T> {
  get instance(): T {
    return this.injector.get(this.type);
  }
  get injector() {
    return this._injector;
  }
  get type(): Type<T> {
    return this._type;
  }
  controllers: Map<any, ControllerRef<any>> = new Map();
  constructor(private _injector: Injector, private _type: Type<T>) {}
  addControllerRef(type: Type<any>, ref: ControllerRef<any>) {
    this.controllers.set(type, ref);
  }
  getControllerRef(type: Type<any>) {
    return this.controllers.get(type);
  }
  get(type: Type<any>) {
    const ref = this.injector.get(PlatformRef);
    return ref.get(type);
  }
}
