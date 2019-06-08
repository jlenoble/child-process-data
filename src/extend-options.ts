import { NormalizedOptions, ExtendedOptions, TestFunction } from "./options";
import { ChildProcessWithReadableStdStreams } from "./child-process";

export default function extendOptions(
  options: NormalizedOptions,
  childProcess: ChildProcessWithReadableStdStreams,
  resolve: Function,
  reject: Function
): ExtendedOptions {
  const outMessages: string[] = [];
  const errMessages: string[] = [];
  const allMessages: string[] = [];

  options.result = {
    // eslint-disable-line no-param-reassign
    childProcess,
    outMessages,
    errMessages,
    allMessages,

    out(): string {
      return this.outMessages.join("");
    },

    err(): string {
      return this.errMessages.join("");
    },

    all(): string {
      return this.allMessages.join("");
    },

    forget(): void {
      this.outMessages.length = 0;
      this.errMessages.length = 0;
      this.allMessages.length = 0;
    },

    forgetUpTo(
      message: string | RegExp,
      { included = false } = { included: false }
    ): void {
      const pattern =
        message instanceof RegExp
          ? message
          : new RegExp(message.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"));
      let aIdx = -1;
      let remains;

      this.allMessages.some(
        (msg: string, idx: number): boolean => {
          const match = msg.match(pattern);

          if (match && typeof match.index == "number") {
            aIdx = idx;
            remains = msg.substring(
              match.index + (included ? match[0].length : 0)
            );

            if (remains) {
              if (msg === this.outMessages[0]) {
                this.outMessages[0] = remains;
              } else {
                this.errMessages[0] = remains;
              }
            } else {
              if (included) {
                if (msg === this.outMessages[0]) {
                  this.outMessages.shift();
                } else {
                  this.errMessages.shift();
                }
              }
            }

            return true;
          }

          if (msg === this.outMessages[0]) {
            this.outMessages.shift();
          } else {
            this.errMessages.shift();
          }

          return false;
        }
      );

      if (aIdx === -1) {
        this.allMessages.length = 0;
        throw new Error(`"${message}" not found in messages up till now`);
      }

      this.allMessages.splice(0, included && !remains ? aIdx + 1 : aIdx);

      if (remains) {
        this.allMessages[0] = remains;
      }
    },

    test(fn: TestFunction | TestFunction[]): boolean {
      return this.multiTest(Array.isArray(fn) ? fn : [fn]);
    },

    multiTest(fns: TestFunction[]): boolean {
      return this.allMessages.every(
        (msg: string): boolean => {
          return fns.every((fn): boolean => fn(msg));
        }
      );
    },

    testUpTo(
      fn: TestFunction | TestFunction[],
      _msg: string | RegExp,
      options: { included?: boolean }
    ): boolean {
      return this.multiTestUpTo(Array.isArray(fn) ? fn : [fn], _msg, options);
    },

    multiTestUpTo(
      fns: TestFunction[],
      _msg: string | RegExp,
      { included = false } = {}
    ): boolean {
      const pattern =
        _msg instanceof RegExp
          ? _msg
          : new RegExp(_msg.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"));

      let pat: RegExpMatchArray | null | undefined;
      let idx = -1;
      let ok = true;

      this.allMessages.every(
        (msg: string, i: number): boolean => {
          pat = msg.match(pattern);
          if (pat) {
            idx = i;
            return false;
          }
          ok = fns.every((fn): boolean => fn(msg));
          return ok;
        }
      );

      // A test failed
      if (!ok) {
        return false;
      }

      // All tests succeeded and pattern was never found
      if (!pat) {
        return true;
      }

      if (typeof pat.index === "number") {
        // All tests succeeded until pattern was found: One last to go
        const m = this.allMessages[idx].substring(
          0,
          pat.index + (included ? pat[0].length : 0)
        );
        return fns.every((fn): boolean => fn(m));
      }

      return false;
    }
  };

  options.resolve = (): void => {
    resolve(options.result);
  };

  options.reject = reject;

  return options as ExtendedOptions;
}
