import { Options, NormalizedOptions } from "./options";
import GulpHandler from "./data-callbacks/gulp-handler";

export default function makeOptions(
  opts: Options,
  childProcessData: { silent: boolean }
): NormalizedOptions {
  const options = Object.assign(
    {
      format: "utf-8",
      silent: childProcessData.silent,
      startDelay: -1,
      listenTime: 30000,
      endDelay: -1,
      dontBlock: false
    },
    opts
  );

  if (options.dontBlock) {
    options.startDelay === -1 && (options.startDelay = 1);
    options.endDelay === -1 && (options.endDelay = 1);
  }

  Object.assign(options, {
    dataCallbacks: {
      ...new GulpHandler(options).getBoundCallbacks()
    }
  });

  return options;
}
