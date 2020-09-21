import { Application } from "@noding/framework";
import Koa from "koa";
export class NextApplication extends Application {
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
    app.use((ctx) => {
      ctx.body = `welcome to use noding next!`;
    });
    app.listen(parseInt(this.platform.config.port), () => {
      console.log(`app start http://localhost:${this.platform.config.port}`);
    });
  }
  restart(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  stop(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
