#!/usr/bin node
import { Platform } from "@noding/framework";
const platform = new Platform();
import { InstallApplication } from "@noding/install";
function install() {
  platform.setApp(new InstallApplication());
  platform.start();
}
export async function bootstrap() {
  if (platform.checkInstalled()) {
    const config = platform.config;
    if (config.main && config.main.length > 0) {
      const app = await import(config.main).then((res) => res.default);
      platform.setApp(app);
      platform.start();
      return;
    }
    install();
  }
  install();
}
