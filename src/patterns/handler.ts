import { ValidationWindow } from "promise-plumber";

export interface ColoringOptions {
  coloredChunk: string;
  logger: [object, string];
}

export interface CallbackOptions {
  pattern: string;
  regexp: RegExp;
  callback: ColoringCallback;
}

export type ColoringCallback = (match: RegExpMatchArray) => ColoringOptions;

export interface ProtoDataCallbacks {
  [pattern: string]: (handler: Handler) => ColoringCallback;
}

export interface DataCallbacks {
  [pattern: string]: ColoringCallback;
}

export default abstract class Handler extends ValidationWindow<void> {
  protected _dataCallbacks: DataCallbacks;
  protected _dataLevel: number;

  public constructor(
    protoDataCallbacks: ProtoDataCallbacks,
    start: Promise<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
    end: Promise<any> // eslint-disable-line @typescript-eslint/no-explicit-any
  ) {
    super(start, end);

    this._dataCallbacks = {};
    this._dataLevel = -1;

    Object.keys(protoDataCallbacks).forEach(
      (key): void => {
        // Bind all data callbacks
        this._dataCallbacks[key] = protoDataCallbacks[key](this);
      }
    );
  }

  public getBoundCallbacks(): DataCallbacks {
    return { ...this._dataCallbacks };
  }

  public dataUp(): void {}
  public dataDown(): void {}
}
