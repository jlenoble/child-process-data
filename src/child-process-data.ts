import stripAnsi from "strip-ansi";
import { Pool, Executor } from "promise-plumber";
import { ChildProcessWithReadableStdStreams } from "./child-process";
import Result from "./messages/result";
import checkChildProcess from "./check-child-process";
import NormalizedOptions, { Options } from "./normalize-options";
import makeOnDataCallback from "./make-on-data-callback";

export class ErrorWithHistory extends Error {
  public readonly result: Result;

  public constructor(code: number, result: Result) {
    const [message, ...stack] = stripAnsi(result.err()).split("\n");

    super(`${message}
child process stream closed with code ${code}`);

    this.stack = stack.join("\n");
    this.result = result;
  }
}

export class ChildProcessData extends Pool<Result> {
  protected static _silent: boolean = false;

  public static mute(): void {
    ChildProcessData._silent = true;
  }
  public static unmute(): void {
    ChildProcessData._silent = false;
  }

  // @ts-ignore
  protected readonly _childProcess: ChildProcessWithReadableStdStreams;
  // @ts-ignore
  protected readonly _options: NormalizedOptions;
  // @ts-ignore
  protected readonly _result: Result;

  public get results(): Result {
    return this._result;
  }

  public constructor(
    childProcess: ChildProcessWithReadableStdStreams | Executor<Result[]>,
    options: Options = {}
  ) {
    if (typeof childProcess === "function") {
      super(childProcess);
      return;
    }

    super();

    try {
      checkChildProcess(childProcess);

      this._childProcess = childProcess;
      this._result = new Result(childProcess);

      // Add this._result to objects returned on resolution
      this.add(this._result);

      this._options = new NormalizedOptions(options);

      const { silent, format, aggregator } = this._options;

      aggregator.then(this.resolve.bind(this), this.reject.bind(this));

      childProcess.stdout.on(
        "data",
        makeOnDataCallback({
          format,
          // @ts-ignore
          allMessages: this._result._allMessages,
          dataCallbacks: this._options.perCallbackOptions,
          silent,
          // @ts-ignore
          messages: this._result._outMessages,
          std: "stdout"
        })
      );

      childProcess.stderr.on(
        "data",
        makeOnDataCallback({
          format,
          // @ts-ignore
          allMessages: this._result._allMessages,
          dataCallbacks: this._options.perCallbackOptions,
          silent,
          // @ts-ignore
          messages: this._result._errMessages,
          std: "stderr"
        })
      );

      childProcess.on(
        "close",
        (code: number): void => {
          if (!code) {
            this.resolve();
          } else {
            this.reject(new ErrorWithHistory(code, this._result));
          }
        }
      );
    } catch (e) {
      this.reject(e);
    }
  }
}

export default async function childProcessData(
  childProcess: ChildProcessWithReadableStdStreams,
  opts: Options = {}
): Promise<Result> {
  const [results] = await new ChildProcessData(childProcess, opts);
  return results;
}
