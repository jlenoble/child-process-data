import { ValidationWindow, delays } from "promise-plumber";
import { Options } from "../options";

export interface ColoringOptions {
  coloredChunk: string;
  logger: [object, string];
}

export interface CallbackOptions {
  pattern: string;
  regexp: RegExp;
  callback: ColoringCallback;
}

export type ColoringCallback = (match: string[]) => ColoringOptions;

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
    options: Options = {}
  ) {
    const p = delays([options.startDelay || 0, options.endDelay || 0]);

    super(p[0], p[1]);

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
