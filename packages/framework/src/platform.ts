import { join } from "path";
import { Application } from "./application";
import { existsSync, readFileSync } from "fs-extra";

export interface PlatformDbConfig {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
}
export interface PlatformRedisConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}
export interface PlatformMqConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}
export interface PlatformConfig {
  main: string;
  version: string;
  port: string;
  db: PlatformDbConfig[];
  redis: PlatformRedisConfig;
  mq: PlatformMqConfig;
}
export class Platform {
  /**
   * 根目录
   */
  get root() {
    return process.cwd();
  }
  get configFile() {
    return join(this.root, "noding.json");
  }
  /**
   * 配置文件
   */
  get config(): PlatformConfig {
    const content = readFileSync(this.configFile).toString("utf-8");
    return JSON.parse(content);
  }
  /**
   * 平台id
   */
  private platformId: string;
  setPlatformId(id: string) {
    this.platformId = id;
  }
  /**
   * 平台id
   */
  private platformKey: string;
  setPlatformKey(key: string) {
    this.platformKey = key;
  }
  /**
   * 平台域名
   */
  private platformDomain: string;
  setPlatformDomain(domain: string) {
    this.platformDomain = domain;
  }
  /**
   * 平台主应用
   */
  app: Application;
  /**
   * 色湖之app
   * @param app
   */
  setApp(app: Application) {
    this.app = app;
    app.setPlatform(this);
  }
  /**
   * 检查是否安装
   */
  checkInstalled() {
    return existsSync(this.configFile);
  }
  /**
   * 启动
   */
  start(): Promise<void> {
    return this.app.start();
  }
  /**
   * 重启
   */
  restart(): Promise<void> {
    return this.app.restart();
  }
  /**
   * 停止
   */
  stop(): Promise<void> {
    return this.app.stop();
  }

  toJson() {
    return {
      id: this.platformId,
      domain: this.platformDomain,
      key: this.platformKey,
    };
  }

  static fromJson(platform: any) {
    const plat = new Platform();
    plat.setPlatformDomain(platform.domain);
    plat.setPlatformId(platform.id);
    plat.setPlatformKey(platform.key);
    return plat;
  }
}
