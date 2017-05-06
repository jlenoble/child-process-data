export default function makeOnCloseCallback (options, resolve, reject) {
  return function (code) {
    if (!code) {
      resolve(options.result);
    } else {
      const error = new Error(`child process stream closed with code ${code}`);
      error.result = options.result;
      reject(error);
    }
  };
}
