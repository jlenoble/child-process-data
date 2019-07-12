import { ChildProcessData } from "./child-process-data";
import { ChildProcessWithReadableStdStreams } from "./child-process";
import { Options } from "./options";
import { waitUntil } from "promise-plumber";

const interval = 10;

function toRegExp(msg: string | RegExp): RegExp {
  let regex = msg;

  if (!(regex instanceof RegExp)) {
    regex = new RegExp(msg.toString().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  }

  return regex;
}

export class MessageInterceptor extends ChildProcessData {
  public async interceptMessage(msg: string | RegExp): Promise<boolean> {
    const regex = toRegExp(msg);
    let found = false;

    await waitUntil((): boolean => {
      found = regex.test(this.results.all());
      return found || this._state.done;
    }, interval);

    return found;
  }
}

export function interceptMessage(
  childProcess: ChildProcessWithReadableStdStreams,
  message: string,
  options: Options = {}
): Promise<boolean> {
  const p = new MessageInterceptor(childProcess, options);
  return p.interceptMessage(message);
}
