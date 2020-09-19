import { Injector } from "@noding/di";
export interface IMiddleware {
  (injector: Injector | Promise<Injector>): Injector | Promise<Injector>;
}
export class Middleware {
  middle: IMiddleware;
  name: string;
  constructor(name: string, middle: IMiddleware) {
    this.name = name;
    this.middle = middle;
  }
}

export type HandlerFunc = (c: Middleware[]) => Promise<any> | any;
export type Param = {
  key: string;
  value: string;
};
export type Params = Param[];

export async function createMiddlewarInjector(
  middlewars: Middleware[],
  injector: Injector
) {
  return await middlewars.reduce((a: Injector | Promise<Injector>, b) => {
    return b.middle(a);
  }, injector);
}
