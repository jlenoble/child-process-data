import HandlerAggregator from "./patterns/aggregator";
import { DataCallbacks } from "./patterns/handler";
import { Result } from "./extend-options";

export interface Options {
  format?: string;
  silent?: boolean;
  startDelay?: number;
  listenTime?: number;
  endDelay?: number;
  dontBlock?: boolean;
  dataCallbacks?: DataCallbacks;
}

export interface NormalizedOptions extends Options {
  format: string;
  silent: boolean;
  startDelay: number;
  listenTime: number;
  endDelay: number;
  dontBlock: boolean;
  dataCallbacks: DataCallbacks;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result?: Result;
  resolve?: Function;
  reject?: Function;
}

export default function normalizeOptions(opts: Options): NormalizedOptions {
  const options = Object.assign(
    {
      format: "utf-8",
      silent: false,
      startDelay: 0,
      listenTime: 30000,
      endDelay: 60000,
      dontBlock: false,
      dataCallbacks: {}
    },
    opts
  );

  if (options.dontBlock) {
    options.startDelay === -1 && (options.startDelay = 1);
    options.endDelay === -1 && (options.endDelay = 1);
  }

  const aggregator = new HandlerAggregator(options);

  Object.assign(options, {
    aggregator,
    dataCallbacks: {
      ...aggregator.getBoundCallbacks()
    }
  });

  return options;
}
