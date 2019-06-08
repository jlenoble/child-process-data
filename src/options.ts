import { DataCallbacks, ColoringCallback } from "./data-callbacks/handler";
import { ChildProcessWithReadableStdStreams } from "./child-process";

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

export type TestFunction = (msg: string) => boolean;

export interface Result {
  childProcess: ChildProcessWithReadableStdStreams;
  outMessages: string[];
  errMessages: string[];
  allMessages: string[];

  out(): string;
  err(): string;
  all(): string;

  forget(): void;
  forgetUpTo(message: string | RegExp, options: { included: boolean }): void;
  test(fn: TestFunction | TestFunction[]): boolean;
  multiTest(fns: TestFunction[]): boolean;
  testUpTo(
    fn: TestFunction | TestFunction[],
    _msg: string | RegExp,
    options: { included?: boolean }
  ): boolean;
  multiTestUpTo(
    fns: TestFunction[],
    _msg: string | RegExp,
    options: { included?: boolean }
  ): boolean;
}

export interface ExtendedOptions extends NormalizedOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: Result;
  resolve: Function;
  reject: Function;
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
