import HandlerAggregator from "./patterns/aggregator";
import { CallbackOptions, DataCallbacks } from "./patterns/handler";
import Result from "./messages/result";
import colorChunkFactory from "./patterns/color-chunk";
import { collapsibleDelays, TimingOutTrigger } from "promise-plumber";

export interface Options {
  format?: string;
  silent?: boolean;
  timeout?: number;
  dataCallbacks?: DataCallbacks;
}

export interface NormalizedOptions extends Options {
  format: string;
  silent: boolean;
  timeout: number;
  dataCallbacks: DataCallbacks;
}

export default class MainOptions {
  public readonly format: string;
  public readonly silent: boolean;
  public readonly startDelay: TimingOutTrigger<number>;
  public readonly endDelay: TimingOutTrigger<number>;
  public readonly perCallbackOptions: CallbackOptions[];

  public readonly aggregator: HandlerAggregator;
  public readonly result: Result;

  public constructor(opts: Options = {}, result: Result) {
    this.result = result;

    const options: NormalizedOptions = Object.assign(
      {
        format: "utf-8",
        silent: false,
        timeout: 60000,
        dataCallbacks: {}
      },
      opts
    );

    this.format = options.format;
    this.silent = options.silent;

    const delays = collapsibleDelays<number>([0, options.timeout]);

    this.startDelay = delays[0];
    this.endDelay = delays[1];

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

  public collapseDelays(): void {
    this.startDelay.resolve();
    this.endDelay.resolve();
  }
}
