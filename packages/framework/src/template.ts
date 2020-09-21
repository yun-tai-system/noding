/**
 * 模板
 */
export abstract class Template {
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
