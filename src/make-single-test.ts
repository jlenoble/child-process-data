import { spawn, SpawnOptionsWithoutStdio, SpawnOptions } from "child_process";
import childProcessData from "./child-process-data";
import { ChildProcessWithReadableStdStreams } from "./child-process";
import Result from "./messages/result";
import deepKill from "deepkill";

type SpawnArguments =
  | [string]
  | [string, SpawnOptionsWithoutStdio | SpawnOptions]
  | [string, string[]]
  | [string, string[], SpawnOptionsWithoutStdio | SpawnOptions];

export interface Options {
  debug?: boolean;
  childProcess?: SpawnArguments;

  setupTest?: () => void | Promise<void>;
  checkResults?: (results: Result) => void | Promise<void>;
  tearDownTest?: () => void | Promise<void>;
}

export class SingleTest {
  protected _childProcess: ChildProcessWithReadableStdStreams | null = null;
  protected _debug: boolean;
  protected _options: Options;
  protected _results: Result | null = null;

  public constructor(options: Options) {
    this._debug = !!options.debug;

    this._options = { ...options };

    if (options.checkResults) {
      // Don't pass directly user check function
      const checkResults = options.checkResults;

      // Instead wrap it to handle ongoing child process
      this._options.checkResults = (results: Result): void | Promise<void> => {
        return checkResults.call(this, results || this._results);
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

    if (Array.isArray(this._options.childProcess)) {
      // @ts-ignore
      this._childProcess = spawn(...this._options.childProcess);
    }

    // @ts-ignore
    this._results = await childProcessData(this._childProcess);
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
}

export function makeSingleTest(
  options: Options = {
    // @ts-ignore
    childProcess: null
  }
): () => Promise<void> {
  return async function(): Promise<void> {
    const singleTest = new SingleTest(options);

    try {
      await singleTest.setupTest();
      await singleTest.spawnTest();
      await singleTest.checkResults();
    } catch (err) {
      await singleTest.tearDownTest();
      throw err;
    }

    await singleTest.tearDownTest();
  };
}
