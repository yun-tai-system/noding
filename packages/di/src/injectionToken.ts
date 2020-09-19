export class InjectionToken<T> {
  readonly ngMetadataName = "InjectionToken";
  readonly name: string;
  constructor(
    protected _desc: string,
    public options?: {
      providedIn: "root" | "platform";
    }
  ) {
    this.name = this._desc;
  }
  toString(): string {
    return `InjectionToken ${this._desc}`;
  }
}
