import Handler, { ProtoDataCallbacks } from "./handler";

class LevelMismatchError extends Error {
  public constructor(ctorName: string) {
    super(`Level mismatch in ${ctorName}`);
  }
}

export default class LevelingHandler extends Handler {
  public constructor(
    protoDataCallbacks: ProtoDataCallbacks,
    start: Promise<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
    end: Promise<any> // eslint-disable-line @typescript-eslint/no-explicit-any
  ) {
    super(protoDataCallbacks, start, end);

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
