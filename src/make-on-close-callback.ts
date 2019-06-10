import stripAnsi from "strip-ansi";
import { ExtendedOptions } from "./extend-options";

export default function makeOnCloseCallback(
  options: ExtendedOptions,
  resolve: Function,
  reject: Function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): (code: any) => void {
  return function(code): void {
    if (!code) {
      resolve(options.result);
    } else {
      const [message, ...stack] = stripAnsi(options.result.err()).split("\n");
      const error = new Error(
        message + `\nchild process stream closed with code ${code}`
      );
      error.stack = stack.join("\n");
      // @ts-ignore
      error.result = options.result;
      reject(error);
    }
  };
}
