import { DataCallbacks, ColoringCallback } from "./patterns/handler";
import { Result } from "./extend-options";

export interface Options {
  format?: string;
  silent?: boolean;
  startDelay?: number;
  listenTime?: number;
  endDelay?: number;
  dontBlock?: boolean;
  dataCallbacks?: DataCallbacks;
}

export interface NormalizedOptions extends Options {
  format: string;
  silent: boolean;
  startDelay: number;
  listenTime: number;
  endDelay: number;
  dontBlock: boolean;
  dataCallbacks: DataCallbacks;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result?: Result;
  resolve?: Function;
  reject?: Function;
}

export interface ColoringOptions {
  coloredChunk: string;
  logger: [object, string];
}

export interface CallbackOptions {
  pattern: string;
  regexp: RegExp;
  callback: ColoringCallback;
}
