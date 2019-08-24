import stripAnsi from "strip-ansi";
import { Pool, Executor } from "promise-plumber";
import { ChildProcessWithReadableStdStreams } from "./child-process";
import toChildProcess, { SpawnArguments } from "./to-child-process";
import Result from "./messages/result";
import checkChildProcess from "./check-child-process";
import MainOptions, { Options } from "./options";

export class ErrorWithHistory extends Error {
  public readonly result: Result;

  public constructor(code: number | Error, result: Result) {
    if (typeof code === "number") {
      const [message, ...stack] = stripAnsi(result.err()).split("\n");

      if (code) {
        super(`${message}
  child process stream closed with code ${code}`);
      } else {
        super(message);
      }

      this.stack = stack.join("\n");
    } else {
      super(code.message);

      this.stack = code.stack;
    }

    this.result = result;
  }
}

export class ChildProcessData extends Pool<Result> {
  protected static _silent = false;

  public static mute(): void {
    ChildProcessData._silent = true;
  }
  public static unmute(): void {
    ChildProcessData._silent = false;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore Not set when ctor is called implicitly and passed an Executor
  protected readonly _childProcess: ChildProcessWithReadableStdStreams;
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore Not set when ctor is called implicitly and passed an Executor
  protected readonly _options: MainOptions;
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore Not set when ctor is called implicitly and passed an Executor
  protected readonly _result: Result;

  public get results(): Result {
    return this._result;
  }

  public constructor(
    childProcess:
      | ChildProcessWithReadableStdStreams
      | SpawnArguments
      | Executor<Result[]>,
    options: Options = {}
  ) {
    if (typeof childProcess === "function") {
      super(childProcess);
      return;
    }

    super();

    try {
      if (Array.isArray(childProcess)) {
        childProcess = toChildProcess(childProcess);
      }

      checkChildProcess(childProcess);

      this._childProcess = childProcess;
      this._result = new Result(childProcess);

      // Add this._result to objects returned on resolution
      this.add(this._result);

      this._options = new MainOptions(options, this._result);

      this._options.aggregator.then(
        this.resolve.bind(this),
        this.reject.bind(this)
      );

      childProcess.stdout.on(
        "data",
        this._options.stdoutData.bind(this._options)
      );

      childProcess.stderr.on(
        "data",
        this._options.stderrData.bind(this._options)
      );

      childProcess.on("close", (code: number): void => {
        if (!code) {
          this.resolve();
        } else {
          this.reject(new ErrorWithHistory(code, this._result));
        }
      });
    } catch (e) {
      this.reject(e);
    }
  }

  public resolve(): void {
    if (this._options) {
      this._options.collapseDelays();
    }
    super.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public reject(reason?: any): void {
    if (this._options) {
      this._options.collapseDelays();
    }
    super.reject(reason);
  }
}

export default async function childProcessData(
  childProcess: ChildProcessWithReadableStdStreams | SpawnArguments,
  opts: Options = {}
): Promise<Result> {
  const [results] = await new ChildProcessData(childProcess, opts);
  return results;
}
