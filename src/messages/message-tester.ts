import MessageAggregator from "./message-aggregator";

export type TestFunction = (msg: string) => boolean;

export default class MessageTester extends MessageAggregator {
  public test(fn: TestFunction | TestFunction[]): boolean {
    return this.multiTest(Array.isArray(fn) ? fn : [fn]);
  }

  public multiTest(fns: TestFunction[]): boolean {
    return this._allMessages.every(
      (msg: string): boolean => {
        return fns.every((fn): boolean => fn(msg));
      }
    );
  }

  public testUpTo(
    fn: TestFunction | TestFunction[],
    _msg: string | RegExp,
    options: { included?: boolean } = { included: false }
  ): boolean {
    return this.multiTestUpTo(Array.isArray(fn) ? fn : [fn], _msg, options);
  }

  public multiTestUpTo(
    fns: TestFunction[],
    _msg: string | RegExp,
    { included = false }: { included?: boolean } = { included: false }
  ): boolean {
    const pattern =
      _msg instanceof RegExp
        ? _msg
        : new RegExp(_msg.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"));

    let pat: RegExpMatchArray | null | undefined;
    let idx = -1;
    let ok = true;

    this._allMessages.every(
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
      const m = this._allMessages[idx].substring(
        0,
        pat.index + (included ? pat[0].length : 0)
      );
      return fns.every((fn): boolean => fn(m));
    }

    return false;
  }
}
