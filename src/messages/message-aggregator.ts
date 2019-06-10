export default class MessageAggregator {
  protected readonly outMessages: string[];
  protected readonly errMessages: string[];
  protected readonly allMessages: string[];

  public constructor() {
    this.outMessages = [];
    this.errMessages = [];
    this.allMessages = [];
  }

  public out(): string {
    return this.outMessages.join("");
  }

  public err(): string {
    return this.errMessages.join("");
  }

  public all(): string {
    return this.allMessages.join("");
  }

  public forget(): void {
    this.outMessages.length = 0;
    this.errMessages.length = 0;
    this.allMessages.length = 0;
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
  }
}
