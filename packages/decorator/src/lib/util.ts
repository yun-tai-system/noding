import "reflect-metadata";
export const getDesignType = (target: any, propertyKey: PropertyKey) =>
  Reflect.getMetadata("design:type", target, propertyKey as any);
export const getDesignParamTypes = (target: any, propertyKey?: PropertyKey) =>
  Reflect.getMetadata("design:paramtypes", target, propertyKey as any);
export const getDesignTargetParams = (target: any) =>
  Reflect.getMetadata("design:paramtypes", target);
export const getDesignReturnType = (target: any, propertyKey: PropertyKey) =>
  Reflect.getMetadata("design:returntype", target, propertyKey as any);
