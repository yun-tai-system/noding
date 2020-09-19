import {
  Middleware,
  Module,
  ModuleWithProviders,
  Type,
  createMiddlewarInjector,
  APP_INITIALIZER,
  Injector,
} from "@noding/core";
import { Observable } from "rxjs";
import { router } from "./router";
type LoadChildrenCallback = () =>
  | Type<any>
  | Observable<Type<any>>
  | Promise<Type<any> | any>;
type DeprecatedLoadChildren = string;
type LoadChildren = LoadChildrenCallback | DeprecatedLoadChildren;
export type RouteMethod = "GET" | "POST" | "PUT" | "DELETE";
export interface Route {
  path: string;
  method: RouteMethod;
  controller?: Type<any>;
  redirectTo?: string;
  canActivate?: any[];
  canActivateChild?: any[];
  canDeactivate?: any[];
  canLoad?: any[];
  children?: Routes;
  loadChildren?: LoadChildren;
}
export type Routes = Route[];
@Module()
export class RouterModule {
  static forRoot(routes: Routes): ModuleWithProviders {
    return {
      ngModule: RouterModule,
      providers: [
        {
          provide: APP_INITIALIZER,
          useValue: (root: Injector) => {
            routes.map((route) =>
              router.add(
                route.method,
                route.path,
                async (middles: Middleware[]) => {[]
                  const injector = await createMiddlewarInjector(middles, root);
                  return injector;
                }
              )
            );
          },
          multi: true,
        },
      ],
    };
  }
  static forChild(routes: Routes): ModuleWithProviders {
    return {
      ngModule: RouterModule,
      providers: [
        {
          provide: APP_INITIALIZER,
          useValue: (root: Injector) => {
            routes.map((route) =>
              router.add(
                route.method,
                route.path,
                async (middles: Middleware[]) => {
                  const injector = await createMiddlewarInjector(middles, root);
                  return injector;
                }
              )
            );
          },
          multi: true,
        },
      ],
    };
  }
}
