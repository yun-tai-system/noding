/**
 * 插件应用
 */
export abstract class Addon {
  /**
   * 应用名
   */
  readonly name: string;
  /**
   * 应用图标
   */
  readonly icon: string;
  /**
   * 版本号
   */
  readonly version: string;
  /**
   * 模板
   */
  readonly template: string;
  /**
   * 应用模板
   */
  abstract useTemplate(): Promise<Error | boolean>;
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
}
