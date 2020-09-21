import { Platform } from "./platform";

/**
 * 主应用
 */
export abstract class Application {
  /**
   * 版本
   */
  version: string;
  /**
   * 所在平台
   */
  platform: Platform;
  /**
   * 设置平台
   * @param platform
   */
  setPlatform(platform: Platform) {
    this.platform = platform;
  }
  /**
   * 初始化
   */
  abstract onInit(): Promise<void>;
  /**
   * 注销
   */
  abstract onDestory(): Promise<void>;
  /**
   * 出错
   * @param err 错误
   */
  abstract onError(err: Error): Promise<void>;
  /**
   * 安装
   */
  abstract install(): Promise<boolean | Error>;
  /**
   * 更新
   */
  abstract upgrade(): Promise<boolean | Error>;
  /**
   * 卸载
   */
  abstract unInstall(): Promise<boolean | Error>;
  /**
   * 检查更新
   */
  abstract checkUpgrade(): Promise<boolean | Error>;
  /**
   * 启动
   */
  abstract start(): Promise<void>;
  /**
   * 重启
   */
  abstract restart(): Promise<void>;
  /**
   * 停止
   */
  abstract stop(): Promise<void>;
}
