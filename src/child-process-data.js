import checkChildProcess from './check-child-process';
import makeOptions from './make-options';
import makeDataCallbacks from './make-data-callbacks';
import extendOptions from './extend-options';
import makeOnDataCallback from './make-on-data-callback';
import makeOnCloseCallback from './make-on-close-callback';

export default function childProcessData (childProcess, opts) {
  checkChildProcess(childProcess);

  const options = makeOptions(opts);
  const dataCallbacks = makeDataCallbacks(options.dataCallbacks);

  return new Promise((resolve, reject) => {
    extendOptions(options, childProcess, resolve, reject);

    const {format} = options;
    const {outMessages, errMessages, allMessages} = options.result;

    childProcess.stdout.on('data', makeOnDataCallback(format, outMessages,
      allMessages, dataCallbacks, 'stdout'));

    childProcess.stderr.on('data', makeOnDataCallback(format, errMessages,
      allMessages, dataCallbacks, 'stderr'));

    childProcess.on('close', makeOnCloseCallback(options, resolve, reject));
  });
}
