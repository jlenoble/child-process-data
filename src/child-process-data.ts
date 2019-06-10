import checkChildProcess from "./check-child-process";
import normalizeOptions from "./normalize-options";
import makeDataCallbacks from "./make-data-callbacks";
import extendOptions from "./extend-options";
import makeOnDataCallback from "./make-on-data-callback";
import makeOnCloseCallback from "./make-on-close-callback";
import { ChildProcessWithReadableStdStreams } from "./child-process";
import { Result } from "./extend-options";

export interface Options {
  silent?: boolean;
}

export default function childProcessData(
  childProcess: ChildProcessWithReadableStdStreams,
  opts: Options = {}
): Promise<Result> {
  checkChildProcess(childProcess);

  const options = normalizeOptions(opts);
  const dataCallbacks = makeDataCallbacks(options.dataCallbacks);

  const p = new Promise(
    (resolve, reject): Promise<void> => {
      extendOptions(options, childProcess, resolve, reject);

      const { format, silent } = options;
      const { _outMessages, _errMessages, _allMessages } = options.result;

      childProcess.stdout.on(
        "data",
        makeOnDataCallback({
          format,
          _allMessages,
          dataCallbacks,
          silent,
          messages: _outMessages,
          std: "stdout"
        })
      );

      childProcess.stderr.on(
        "data",
        makeOnDataCallback({
          format,
          _allMessages,
          dataCallbacks,
          silent,
          messages: _errMessages,
          std: "stderr"
        })
      );

      childProcess.on("close", makeOnCloseCallback(options, resolve, reject));

      if (options.startDelay > 0) {
        setTimeout(options.resolve, options.startDelay);
      }
    }
  );

  p.results = options.result;

  return p;
}

Object.defineProperty(childProcessData, "silent", {
  value: false,
  writable: true
});

childProcessData.mute = function(): void {
  childProcessData.silent = true;
};

childProcessData.unmute = function(): void {
  childProcessData.silent = false;
};
