import { Application } from "@noding/framework";
import Koa from "koa";
import { join } from "path";
import { cpus } from "os";
import KoaRouter = require("koa-router");
import { writeFileSync } from "fs-extra";
const KoaBody = require("koa-body");
const KoaStatic = require("koa-static");

export class InstallApplication extends Application {
  onInit(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  onDestory(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  onError(err: Error): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async install(): Promise<boolean | Error> {
    return true;
  }
  upgrade(): Promise<boolean | Error> {
    throw new Error("Method not implemented.");
  }
  unInstall(): Promise<boolean | Error> {
    throw new Error("Method not implemented.");
  }
  async checkUpgrade(): Promise<boolean | Error> {
    return false;
  }
  private installBasic() {
    return `@noding/basic`;
  }
  private installNext() {
    return `@noding/next`;
  }
  private installPro() {
    return `@noding/pro`;
  }
  /**
   * 启动应用安装程序
   */
  app: Koa;
  appStoped: boolean;
  async start(): Promise<void> {
    const app = new Koa();
    const port = 5050;
    const router = new KoaRouter();
    app.use(KoaBody());
    app.use(async (ctx, next) => {
      if (this.appStoped) {
        ctx.body = `I am sorry, app has installed!`;
        return;
      }
      await next()
    });
    router.get("/systeminfo", (ctx) => {
      ctx.body = {
        version: "1.0",
        cpus: cpus(),
      };
    });
    router.post("/install", async (ctx) => {
      const body = (ctx.request as any).body;
      switch (body.version) {
        case "basic":
          body.main = await this.installBasic();
          break;
        case "next":
          body.main = await this.installNext();
          break;
        case "pro":
          body.main = await this.installPro();
          break;
        default:
          break;
      }
      writeFileSync(this.platform.configFile, JSON.stringify(body, null, 2));
      const app = await import(body.main).then((res) => res.default);
      this.platform.stop().then(() => {
        this.platform.setApp(app);
        this.platform.start();
      });
      ctx.body = {
        port: `${this.platform.config.port}`,
      };
    });
    app.use(KoaStatic(join(__dirname, "public")));
    app.use(router.routes()).use(router.allowedMethods());
    app.listen(port, () => {
      console.log(`请打开 http://localhost:${port} 进行安装`);
    });
    this.app = app;
  }
  restart(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async stop(): Promise<void> {
    // 关闭
    this.appStoped = true;
  }
}
