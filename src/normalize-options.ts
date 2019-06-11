import HandlerAggregator from "./patterns/aggregator";
import { CallbackOptions, DataCallbacks } from "./patterns/handler";
import Result from "./messages/result";
import colorChunkFactory from "./patterns/color-chunk";

export interface Options {
  format?: string;
  silent?: boolean;
  startDelay?: number;
  listenTime?: number;
  endDelay?: number;
  dontBlock?: boolean;
  dataCallbacks?: DataCallbacks;
}

export default class NormalizedOptions implements Options {
  public readonly format: string;
  public readonly silent: boolean;
  public readonly startDelay: number;
  public readonly listenTime: number;
  public readonly endDelay: number;
  public readonly dontBlock: boolean;
  public readonly perCallbackOptions: CallbackOptions[];

  public readonly aggregator: HandlerAggregator;
  public readonly result: Result;

  public constructor(opts: Options = {}, result: Result) {
    this.result = result;

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

    this.format = options.format;
    this.silent = options.silent;
    this.startDelay = options.startDelay;
    this.listenTime = options.listenTime;
    this.endDelay = options.endDelay;
    this.dontBlock = options.dontBlock;

    const aggregator = new HandlerAggregator(this);
    const callbacks: DataCallbacks = { ...aggregator.getBoundCallbacks() };

    this.perCallbackOptions = Object.keys(callbacks).map(
      (key): CallbackOptions => ({
        pattern: key,
        regexp: new RegExp(key),
        callback: callbacks[key]
      })
    );

    this.aggregator = aggregator;
  }

  public stdoutData(data: Buffer): void {
    const str = data.toString(this.format);
    this.result.outPush(str);
    this.result.allPush(str);

    const colorChunk = colorChunkFactory({
      silent: this.silent,
      std: "stdout",
      perCallbackOptions: this.perCallbackOptions
    });

    colorChunk(str);
  }

  public stderrData(data: Buffer): void {
    const str = data.toString(this.format);
    this.result.errPush(str);
    this.result.allPush(str);

    const colorChunk = colorChunkFactory({
      silent: this.silent,
      std: "stderr",
      perCallbackOptions: this.perCallbackOptions
    });

    colorChunk(str);
  }
}
