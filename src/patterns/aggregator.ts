import { Executor, delays, Sink } from "promise-plumber";
import Handler, { DataCallbacks } from "./handler";
import GulpHandler from "./gulp-handler";
import { NormalizedOptions } from "../normalize-options";

export default class HandlerAggregator extends Sink<Handler> {
  protected _handlers: Set<Handler>;

  public constructor(options: NormalizedOptions | Executor<Handler[]>) {
    if (typeof options === "function") {
      super(options);
      this._handlers = new Set();
      super.resolve();
    } else {
      super();
      const p = delays([options.startDelay || 0, options.endDelay || 2000]);
      this._handlers = new Set();
      this.add(new GulpHandler(p[0], p[1]));
    }
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
    if (this._handlers.size > 0) {
      for (const handler of this._handlers) {
        handler.resolve();
      }

      this._handlers.clear();
    }

    super.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public reject(reason?: any): void {
    super.reject(reason);
    this.resolve();
  }
}
