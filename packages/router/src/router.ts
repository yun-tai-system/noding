import { Node } from "./node";
import { HandlerFunc, Params } from "./types";

export class Router {
  trees: Record<string, Node> = {};
  add(method: string, path: string, h: HandlerFunc): void {
    if (path[0] !== "/") {
      path = `/${path}`;
    }
    let root = this.trees[method];
    if (!root) {
      root = new Node();
      this.trees[method] = root;
    }
    root.addRoute(path, h);
  }
  /**
   *
   * @param injector [Url,HTTP_METHOD]
   */
  find(
    pathName: string,
    method: string
  ): [HandlerFunc | undefined, Params | undefined, boolean] {
    const node = this.trees[method];
    let val: any = [undefined, undefined, false];
    if (node) {
      val = node.getValue(pathName);
    }
    return val;
  }
}

export const router = new Router();
