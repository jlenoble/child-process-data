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

      this.allMessages.some((msg, idx) => {
        if (msg.match(pattern)) {
          aIdx = idx;

          if (included) {
            if (msg === this.outMessages[0]) {
              this.outMessages.shift();
            } else {
              this.errMessages.shift();
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

      this.allMessages.splice(0, included ? aIdx + 1 : aIdx);
    },
  };

  options.resolve = () => { // eslint-disable-line no-param-reassign
    resolve(options.result);
  };

  options.reject = reject; // eslint-disable-line no-param-reassign

  return options;
}
