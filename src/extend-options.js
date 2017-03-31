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
  };
  options.resolve = () => { // eslint-disable-line no-param-reassign
    resolve(options.result);
  };
  options.reject = reject; // eslint-disable-line no-param-reassign

  return options;
}
