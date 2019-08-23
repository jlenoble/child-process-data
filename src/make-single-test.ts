import toChildProcess, { SpawnArguments } from "./to-child-process";
import childProcessData, { ErrorWithHistory } from "./child-process-data";
import { ChildProcessWithReadableStdStreams } from "./child-process";
import Result from "./messages/result";
import deepKill from "deepkill";

export interface SingleOptions {
  debug?: boolean;
  silent?: boolean;
  childProcess?: SpawnArguments | ChildProcessWithReadableStdStreams;

  setupTest?: () => void | Promise<void>;
  spawnTest?: () => void | Promise<void>;
  checkResults?: (results: Result) => void | Promise<void>;
  tearDownTest?: () => void | Promise<void>;
  onError?: (err: ErrorWithHistory) => void | Promise<void>;
}

export class SingleTest {
  protected _childProcess: ChildProcessWithReadableStdStreams | null = null;
  protected _debug: boolean;
  protected _silent: boolean;
  protected _options: SingleOptions;
  protected _results: Result | null = null;

  public constructor(options: SingleOptions) {
    this._debug = !!options.debug;
    this._silent = !!options.silent;

    this._options = { ...options };

    if (options.checkResults) {
      // Don't pass directly user check function
      const checkResults = options.checkResults;

      // Instead wrap it to handle ongoing child process
      this._options.checkResults = (results: Result): void | Promise<void> => {
        return checkResults.call(this, results || this._results);
      };
    }

    if (options.onError) {
      // Don't pass directly user error function
      const onError = options.onError;

      // Instead wrap it to handle ongoing child process
      this._options.onError = (
        err: Error | ErrorWithHistory
      ): void | Promise<void> => {
        if (err instanceof ErrorWithHistory) {
          return onError.call(this, err);
        } else if (this._results !== null) {
          return onError.call(this, new ErrorWithHistory(err, this._results));
        } else {
          throw err;
        }
      };
    }
  }

  public async setupTest(): Promise<void> {
    if (this._debug) {
      console.log("[makeSingleTest] setupTest");
    }
    if (this._options.setupTest) {
      return this._options.setupTest();
    }
  }

  public async spawnTest(): Promise<void> {
    if (this._debug) {
      console.log("[makeSingleTest] spawnTest");
    }

    if (this._options.spawnTest) {
      return this._options.spawnTest();
    }

    if (Array.isArray(this._options.childProcess)) {
      this._childProcess = toChildProcess(this._options.childProcess);
    } else if (this._options.childProcess) {
      this._childProcess = this._options.childProcess;
    }

    this._results = await childProcessData(
      this._childProcess as ChildProcessWithReadableStdStreams,
      {
        silent: this._silent
      }
    );
  }

  public async checkResults(): Promise<void> {
    if (this._debug) {
      console.log("[makeSingleTest] checkResults");
    }
    if (this._options.checkResults) {
      if (this._results) {
        return this._options.checkResults(this._results);
      }
    } else {
      throw new Error("checkResults callback must be overridden");
    }
  }

  public async tearDownTest(): Promise<void> {
    if (this._debug) {
      console.log("[makeSingleTest] tearDownTest");
    }

    if (this._childProcess) {
      await deepKill(this._childProcess.pid);
    }

    if (this._options.tearDownTest) {
      await this._options.tearDownTest();
    }
  }

  public async onError(err: ErrorWithHistory): Promise<void> {
    if (this._debug) {
      console.log("[makeSingleTest] onError");
    }
    if (this._options.onError) {
      return this._options.onError(err);
    } else {
      throw err;
    }
  }
}

export function makeSingleTest(
  options: SingleOptions = {}
): () => Promise<void> {
  return async function(): Promise<void> {
    const singleTest = new SingleTest(options);

    try {
      await singleTest.setupTest();
      await singleTest.spawnTest();
      await singleTest.checkResults();
    } catch (err) {
      try {
        await singleTest.onError(err);
      } catch (e) {
        await singleTest.tearDownTest();
        throw e;
      }
    }

    await singleTest.tearDownTest();
  };
}
