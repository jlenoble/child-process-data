export default class MessageAggregator {
  protected readonly _outMessages: string[];
  protected readonly _errMessages: string[];
  protected readonly _allMessages: string[];

  public constructor() {
    this._outMessages = [];
    this._errMessages = [];
    this._allMessages = [];
  }

  public out(): string {
    return this._outMessages.join("");
  }

  public err(): string {
    return this._errMessages.join("");
  }

  public all(): string {
    return this._allMessages.join("");
  }

  public outMessages(): string[] {
    return this._outMessages.concat();
  }

  public errMessages(): string[] {
    return this._errMessages.concat();
  }

  public allMessages(): string[] {
    return this._allMessages.concat();
  }

  public outPush(str: string): void {
    this._outMessages.push(str);
  }

  public errPush(str: string): void {
    this._errMessages.push(str);
  }

  public allPush(str: string): void {
    this._allMessages.push(str);
  }

  public forget(): void {
    this._outMessages.length = 0;
    this._errMessages.length = 0;
    this._allMessages.length = 0;
  }

  public forgetUpTo(
    message: string | RegExp,
    { included = false } = { included: false }
  ): void {
    const pattern =
      message instanceof RegExp
        ? message
        : new RegExp(message.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"));
    let aIdx = -1;
    let remains;

    this._allMessages.some(
      (msg: string, idx: number): boolean => {
        const match = msg.match(pattern);

        if (match && typeof match.index == "number") {
          aIdx = idx;
          remains = msg.substring(
            match.index + (included ? match[0].length : 0)
          );

          if (remains) {
            if (msg === this._outMessages[0]) {
              this._outMessages[0] = remains;
            } else {
              this._errMessages[0] = remains;
            }
          } else {
            if (included) {
              if (msg === this._outMessages[0]) {
                this._outMessages.shift();
              } else {
                this._errMessages.shift();
              }
            }
          }

          return true;
        }

        if (msg === this._outMessages[0]) {
          this._outMessages.shift();
        } else {
          this._errMessages.shift();
        }

        return false;
      }
    );

    if (aIdx === -1) {
      this._allMessages.length = 0;
      throw new Error(`"${message}" not found in messages up till now`);
    }

    this._allMessages.splice(0, included && !remains ? aIdx + 1 : aIdx);

    if (remains) {
      this._allMessages[0] = remains;
    }
  }
}
