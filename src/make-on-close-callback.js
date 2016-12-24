export default function makeOnCloseCallback (options, resolve, reject) {
  return function (code) {
    if (!code) {
      resolve(options.result);
    } else {
      const {outMessages, errMessages, allMessages} = options.result;
      let error = new Error(`child process stream closed with code ${code}
>>>>stdout buffer
${outMessages.join('')}<<<<end stdout buffer
>>>>stderr buffer
${errMessages.join('')}<<<<end stderr buffer
>>>>dual buffer
${allMessages.join('')}<<<<end dual buffer`);
      error.result = options.result;
      reject(error);
    }
  };
}
