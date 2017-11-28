export default function extendOptions (options, childProcess, resolve, reject) {
  const outMessages = [];
  const errMessages = [];
  const allMessages = [];

  options.result = { // eslint-disable-line no-param-reassign
    childProcess, outMessages, errMessages, allMessages,

    out () {
      return this.outMessages.join('');
    },

    err () {
      return this.errMessages.join('');
    },

    all () {
      return this.allMessages.join('');
    },

    forget () {
      this.outMessages.length = 0;
      this.errMessages.length = 0;
      this.allMessages.length = 0;
    },

    forgetUpTo (message, options = {}) {
      const pattern = message instanceof RegExp ? message : new RegExp(message);
      const {included} = options;
      let aIdx = -1;
      let remains;

      this.allMessages.some((msg, idx) => {
        const match = msg.match(pattern);

        if (match) {
          aIdx = idx;

          if (msg.length !== pattern.source.length) {
            remains = msg.substring(match.index +
              (included ? pattern.source.length : 0));
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
      });

      if (aIdx === -1) {
        this.allMessages.length = 0;
        throw new Error(`"${message}" not found in messages up till now`);
      }

      this.allMessages.splice(0, (included && !remains) ? aIdx + 1: aIdx);

      if (remains) {
        this.allMessages[0] = remains;
      }
    },

    test (fn) {
      const f = fn && typeof fn[Symbol.iterator] === 'function' ? fn : [fn];
      return this.multiTest(f);
    },

    multiTest (fns) {
      return this.allMessages.every(msg => {
        let ok = true;
        for (let fn of fns) {
          ok = fn(msg);
          if (!ok) {
            break;
          }
        }
        return ok;
      });
    },

    testUpTo (fn, _msg) {
      const f = fn && typeof fn[Symbol.iterator] === 'function' ? fn : [fn];
      return this.multiTestUpTo(f, _msg);
    },

    multiTestUpTo (fns, _msg) {
      const pattern = new RegExp(_msg);

      let pat;
      let ok = true;
      let idx = -1;

      this.allMessages.every((msg, i) => {
        pat = msg.match(pattern);
        if (pat) {
          idx = i;
          return false;
        }
        for (let fn of fns) {
          ok = fn(msg);
          if (!ok) {
            break;
          }
        }
        return ok;
      });

      // A test failed
      if (!ok) {
        return false;
      }

      // All tests succeeded and pattern was never found
      if (!pat) {
        return true;
      }

      // All tests succeeded until pattern was found: One last to go
      ok = true;
      const m = this.allMessages[idx].substring(0, pat.index);
      for (let fn of fns) {
        ok = fn(m);
        if (!ok) {
          break;
        }
      }
      return ok;
    },
  };

  options.resolve = () => { // eslint-disable-line no-param-reassign
    resolve(options.result);
  };

  options.reject = reject; // eslint-disable-line no-param-reassign

  return options;
}
