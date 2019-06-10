import { Options, NormalizedOptions } from "./options";
import HandlerAggregator from "./patterns/aggregator";

export default function normalizeOptions(opts: Options): NormalizedOptions {
  const options = Object.assign(
    {
      format: "utf-8",
      silent: false,
      startDelay: -1,
      listenTime: 30000,
      endDelay: -1,
      dontBlock: false,
      dataCallbacks: {}
    },
    opts
  );

  if (options.dontBlock) {
    options.startDelay === -1 && (options.startDelay = 1);
    options.endDelay === -1 && (options.endDelay = 1);
  }

  Object.assign(options, {
    dataCallbacks: {
      ...new HandlerAggregator(options).getBoundCallbacks()
    }
  });

  return options;
}
