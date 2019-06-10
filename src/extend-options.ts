import { NormalizedOptions } from "./options";
import { ChildProcessWithReadableStdStreams } from "./child-process";
import MessageTester, { TestFunction } from "./messages/message-tester";

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

export default function extendOptions(
  options: NormalizedOptions,
  childProcess: ChildProcessWithReadableStdStreams,
  resolve: Function,
  reject: Function
): ExtendedOptions {
  options.result = new MessageTester();
  options.result.childProcess = childProcess;

  options.resolve = (): void => {
    resolve(options.result);
  };

  options.reject = reject;

  return options as ExtendedOptions;
}
