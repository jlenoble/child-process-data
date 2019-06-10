import { delays, Sink } from "promise-plumber";
import Handler, { DataCallbacks } from "./handler";
import GulpHandler from "./gulp-handler";
import { NormalizedOptions } from "../options";

export default class HandlerAggregator extends Sink<Handler> {
  protected _handlers: Set<Handler> = new Set();

  public constructor(options: NormalizedOptions) {
    super();

    const p = delays([options.startDelay || 0, options.endDelay || 0]);

    this.add(new GulpHandler(p[0], p[1]));
  }

  public add(handler: Handler): this {
    if (!this._handlers.has(handler)) {
      this._handlers.add(handler);
      super.add(handler);
    }

    return this;
  }

  public getBoundCallbacks(): DataCallbacks {
    const callbacks = {};

    for (const handler of this._handlers) {
      Object.assign(callbacks, handler.getBoundCallbacks());
    }

    return callbacks;
  }

  public resolve(): void {
    for (const handler of this._handlers) {
      handler.resolve();
    }

    this._handlers.clear();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public reject(reason?: any): void {
    super.reject(reason);
    this.resolve();
  }
}
