import { spawn, SpawnOptionsWithoutStdio } from "child_process";
import { ChildProcessData } from "./child-process-data";
import { SingleTest, SingleOptions } from "./make-single-test";
import { waitUntil } from "promise-plumber";

interface Message {
  i?: string;
  o?: string;
  e?: string;
  io?: [string, string];
  ie?: [string, string];
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IOOptions extends SingleOptions {
  childProcessFile?: string;
  childProcessOptions?: string[];
  timeout?: number;
  waitForAnswer?: number;
  messages?: Message[];
}

export class IOTest extends SingleTest {
  protected _childProcessFile: string;
  protected _childProcessOptions: string[];
  protected _timeout: number;
  protected _waitForAnswer: number;
  protected _messages: Message[];

  public constructor(options: IOOptions) {
    super(options);

    this._childProcessFile = options.childProcessFile || "";
    this._childProcessOptions = options.childProcessOptions || [];
    this._timeout = options.timeout || 60000;
    this._waitForAnswer = options.waitForAnswer || 50;
    this._messages = options.messages || [];
  }

  public checkStdio(): void {
    if (!this._childProcess) {
      return;
    }

    // IO streams must be piped!
    if (this._childProcess.stdin === null) {
      throw new ReferenceError("Parent/child stdins not piped");
    }

    if (this._childProcess.stdout === null) {
      throw new ReferenceError("Parent/child stdouts not piped");
    }

    if (this._childProcess.stderr === null) {
      throw new ReferenceError("Parent/child stderrs not piped");
    }
  }

  public async spawnTest(): Promise<void> {
    if (this._debug) {
      console.log("[makeSingleTest] spawnTest");
    }

    if (this._options.childProcess) {
      if (Array.isArray(this._options.childProcess)) {
        const [cmd, args, _options] = this._options.childProcess as [
          string,
          string[],
          SpawnOptionsWithoutStdio
        ];

        if (_options && _options.stdio) {
          const stdio = _options.stdio;

          if (stdio !== "pipe" && Array.isArray(stdio)) {
            if (!(stdio as string[]).every((opt): boolean => opt === "pipe")) {
              throw new Error("Bad stdio option, must be 'pipe'");
            }
          }
        }

        this._childProcess = spawn(
          cmd,
          args as string[],
          (_options as SpawnOptionsWithoutStdio) || { stdio: "pipe" }
        );
      }

      this.checkStdio();
    } else {
      if (!this._childProcessFile) {
        throw new ReferenceError(
          "childProcessFile should be defined; will be passed to node"
        );
      }

      if (!Array.isArray(this._childProcessOptions)) {
        if (typeof this._childProcessOptions !== "string") {
          throw new TypeError(
            "Bad childProcessOptions; must be string or array of strings"
          );
        }

        this._childProcessOptions = [this._childProcessOptions];
      }

      const p = spawn(
        "node",
        [this._childProcessFile, ...this._childProcessOptions],
        { stdio: "pipe" }
      );

      this._childProcess = p;
    }

    if (this._childProcess) {
      this._results = new ChildProcessData(this._childProcess, {
        silent: this._silent
      }).results;
    }
  }

  public async checkResults(): Promise<void> {
    if (!this._childProcess) {
      return;
    }

    if (this._options.checkResults) {
      return super.checkResults();
    }

    if (this._debug) {
      console.log("[makeSingleTest] checkResults");
    }

    const stdin = this._childProcess.stdin;

    if (!stdin) {
      return;
    }

    let inMsg = "";
    let outMsg = "";

    const handleMessage = (msg: Message): void => {
      const [scheme] = Object.keys(msg);

      switch (scheme) {
        case "i":
          inMsg = msg[scheme] as string;
          stdin.write(inMsg + "\r");
          break;

        case "o":
          outMsg = msg[scheme] as string;
          break;

        case "e":
          outMsg = msg[scheme] as string;
          break;

        case "io":
          [inMsg, outMsg] = msg[scheme] as [string, string];
          stdin.write(inMsg + "\r");
          break;

        case "ie":
          [inMsg, outMsg] = msg[scheme] as [string, string];
          stdin.write(inMsg + "\r");
          break;

        default:
          throw new Error("Unsupported IO scheme: " + scheme);
      }
    };

    const iter = this._messages[Symbol.iterator]();
    let value: Message;
    let done: boolean;
    const start = Date.now();

    await waitUntil((): boolean => {
      if (!value) {
        const nx = iter.next();
        value = nx.value;
        done = nx.done;
        handleMessage(value);
      }

      if (!this._results) {
        return true;
      }

      if (Date.now() - this._timeout > start) {
        throw new Error(
          `[Timeout] Could not intercept ${JSON.stringify(outMsg)}`
        );
      }

      if (this._results.includes(outMsg)) {
        this._results.forgetUpTo(outMsg, { included: true });
        const nx = iter.next();
        value = nx.value;
        done = nx.done;

        if (!done) {
          handleMessage(value);
        }
      }

      return done;
    }, this._waitForAnswer);
  }

  public async tearDownTest(): Promise<void> {
    if (this._childProcess && this._childProcess.stdin) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore May not have been opened in parent
      this._childProcess.stdin.pause();
    }
    return super.tearDownTest();
  }
}

export function makeIOTest(options: IOOptions = {}): () => Promise<void> {
  return async function(): Promise<void> {
    const ioTest = new IOTest(options);

    try {
      await ioTest.setupTest();
      await ioTest.spawnTest();
      await ioTest.checkResults();
    } catch (err) {
      try {
        await ioTest.onError(err);
      } catch (e) {
        await ioTest.tearDownTest();
        throw err;
      }
    }

    await ioTest.tearDownTest();
  };
}
