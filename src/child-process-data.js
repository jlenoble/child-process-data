import checkChildProcess from './check-child-process';
import makeOptions from './make-options';
import makeDataCallbacks from './make-data-callbacks';
import extendOptions from './extend-options';
import makeOnDataCallback from './make-on-data-callback';
import makeOnCloseCallback from './make-on-close-callback';

export default function childProcessData (childProcess, opts) {
  checkChildProcess(childProcess);

  const options = makeOptions(opts, childProcessData);
  const dataCallbacks = makeDataCallbacks(options.dataCallbacks);

  const p = new Promise((resolve, reject) => {
    extendOptions(options, childProcess, resolve, reject);

    const {format, silent} = options;
    const {outMessages, errMessages, allMessages} = options.result;

    childProcess.stdout.on('data', makeOnDataCallback({
      format, allMessages, dataCallbacks, silent,
      messages: outMessages,
      std: 'stdout',
    }));

    childProcess.stderr.on('data', makeOnDataCallback({
      format, allMessages, dataCallbacks, silent,
      messages: errMessages,
      std: 'stderr',
    }));

    childProcess.on('close', makeOnCloseCallback(options, resolve, reject));
  });

  p.results = options.result;

  return p;
}

Object.defineProperty(childProcessData, 'silent', {
  value: false,
  writable: true,
});

childProcessData.mute = function () {
  childProcessData.silent = true;
};

childProcessData.unmute = function () {
  childProcessData.silent = false;
};
