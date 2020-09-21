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
    writeFileSync(this.platform.lock, "");
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
    return ``;
  }

  private installNext() {
    return ``;
  }

  private installPro() {
    return ``;
  }
  /**
   * 启动应用安装程序
   */
  async start(): Promise<void> {
    const app = new Koa();
    const port = 5050;
    const router = new KoaRouter();
    app.use(KoaBody());
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
      writeFileSync(
        join(this.platform.root, "noding.json"),
        JSON.stringify(body, null, 2)
      );
      const app = require(body.main).default;
      this.platform.stop();
      this.platform.setApp(app);
      this.platform.start();
    });
    app.use(KoaStatic(join(__dirname, "public")));
    app.use(router.routes()).use(router.allowedMethods());
    app.listen(port, () => {
      console.log(`请打开 http://localhost:${port} 进行安装`);
    });
  }
  restart(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async stop(): Promise<void> {
    process.exit(0);
  }
}
