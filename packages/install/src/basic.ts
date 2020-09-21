import { Application } from "@noding/framework";
import Koa from "koa";
import { join } from "path";
import { cpus } from "os";
import KoaRouter = require("koa-router");
import { writeFileSync } from "fs-extra";
const KoaBody = require("koa-body");
const KoaStatic = require("koa-static");

export class BasicApplication extends Application {
  onInit(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  onDestory(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  onError(err: Error): Promise<void> {
    throw new Error("Method not implemented.");
  }
  install(): Promise<boolean | Error> {
    throw new Error("Method not implemented.");
  }
  upgrade(): Promise<boolean | Error> {
    throw new Error("Method not implemented.");
  }
  unInstall(): Promise<boolean | Error> {
    throw new Error("Method not implemented.");
  }
  checkUpgrade(): Promise<boolean | Error> {
    throw new Error("Method not implemented.");
  }
  async start(): Promise<void> {
    const app = new Koa();
    const router = new KoaRouter();
    app.use(router.routes()).use(router.allowedMethods());
    app.listen(5000, () => {
      console.log(`app start at http://localhost:5000`);
    });
  }
  restart(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  stop(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
