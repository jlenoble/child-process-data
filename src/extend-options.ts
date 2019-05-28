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

    forgetUpTo (message, {included = false} = {}) {
      const pattern = message instanceof RegExp ? message : new RegExp(
        message.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'));
      let aIdx = -1;
      let remains;

      this.allMessages.some((msg, idx) => {
        const match = msg.match(pattern);

        if (match) {
          aIdx = idx;
          remains = msg.substring(match.index +
            (included ? match[0].length : 0));

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
      return this.multiTest(Array.isArray(fn) ? fn : [fn]);
    },

    multiTest (fns) {
      return this.allMessages.every(msg => {
        return fns.every(fn => fn(msg));
      });
    },

    testUpTo (fn, _msg, options) {
      return this.multiTestUpTo(Array.isArray(fn) ? fn : [fn], _msg, options);
    },

    multiTestUpTo (fns, _msg, {included = false} = {}) {
      const pattern = _msg instanceof RegExp ? _msg : new RegExp(
        _msg.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'));

      let pat;
      let idx = -1;
      let ok = true;

      this.allMessages.every((msg, i) => {
        pat = msg.match(pattern);
        if (pat) {
          idx = i;
          return false;
        }
        ok = fns.every(fn => fn(msg));
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
      const m = this.allMessages[idx].substring(0, pat.index + (included ?
        pat[0].length : 0));
      return fns.every(fn => fn(m));
    },
  };

  options.resolve = () => { // eslint-disable-line no-param-reassign
    resolve(options.result);
  };

  options.reject = reject; // eslint-disable-line no-param-reassign

  return options;
}
