import { Options } from "../options";
import Handler, { ProtoDataCallbacks } from "./handler";

class LevelMismatchError extends Error {
  public constructor(ctorName: string) {
    super(`Level mismatch in ${ctorName}`);
  }
}

export default class LevelingHandler extends Handler {
  public constructor(
    protoDataCallbacks: ProtoDataCallbacks,
    options?: Options
  ) {
    super(protoDataCallbacks, options);

    this._dataLevel = 0;
  }

  public dataUp(): void {
    if (this._state.running) {
      this._dataLevel++;
      return;
    }

    this.reject(new LevelMismatchError(this.constructor.name));
  }

  public dataDown(): void {
    if (this._state.running) {
      this._dataLevel--;

      if (this._dataLevel > 0) {
        return;
      }

      if (this._dataLevel === 0) {
        this.resolve();
        return;
      }
    }

    this.reject(new LevelMismatchError(this.constructor.name));
  }
}
