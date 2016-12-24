export default function extendOptions (options, childProcess, resolve, reject) {
  const outMessages = [];
  const errMessages = [];
  const allMessages = [];

  options.result = {
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
  options.resolve = () => {
    resolve(options.result);
  };
  options.reject = reject;

  return options;
}
