import { Type } from "./types";
export class DecoratorStore {
  // tslint:disable-next-line: variable-name
  private _map: Map<string, Set<any>> = new Map();
  /**
   * 设置
   * @param @string metadataKey
   // tslint:disable-next-line: no-redundant-jsdoc
   * @param @Type val
   */
  set<T = any>(metadataKey: string, val: Type<T>) {
    const allTypes = this.get(metadataKey);
    allTypes.add(val);
    this._map.set(metadataKey, allTypes);
  }
  /**
   * 获取使用某个装饰器的所有类
   * @param @string metadataKey
   */
  get<T>(metadataKey: string): Set<T> {
    let allTypes = this._map.get(metadataKey);
    if (!allTypes) {
      allTypes = new Set();
    }
    return allTypes;
  }
}
export const clsStore = new DecoratorStore();
