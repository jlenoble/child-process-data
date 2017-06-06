import stripAnsi from 'strip-ansi';

export default function makeOnCloseCallback (options, resolve, reject) {
  return function (code) {
    if (!code) {
      resolve(options.result);
    } else {
      const [message, ...stack] = stripAnsi(options.result.err().split('\n'));
      const error = new Error(message +
        `\nchild process stream closed with code ${code}`);
      error.stack = stack.join('\n');
      error.result = options.result;
      reject(error);
    }
  };
}
