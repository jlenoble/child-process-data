import chalk from "chalk";
import { CallbackOptions, ColoringOptions } from "./handler";

interface Options {
  silent: boolean;
  std: "stdout" | "stderr";
  perCallbackOptions: CallbackOptions[];
}

interface Result extends ColoringOptions {
  match: RegExpMatchArray;
}

export default function ColorChunkFactory({
  silent,
  std,
  perCallbackOptions
}: Options): (chunk: string) => void {
  return function colorChunk(chunk: string): void {
    if (chunk === "\n") {
      return;
    }

    if (chunk[0] === "\n") {
      return colorChunk(chunk.substring(1));
    }

    let found = false;
    let result: Result;

    perCallbackOptions.some(({ regexp, callback }): boolean => {
      const match = chunk.match(regexp);
      if (match) {
        found = true;
        result = Object.assign(callback(match), { match });
      }
      return found;
    });

    if (!found) {
      if (!silent) {
        process[std].write(chalk.yellow(chunk));
      }
      return;
    }

    const {
      coloredChunk,
      logger: [_logger, method],
      match
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore result *IS* assigned since found is true
    } = result;

    const index = match.index || 0;

    if (index > 0) {
      colorChunk(chunk.substring(0, index));
    }

    if (!silent) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore Limitation of TS: [a,b]|[c,d] is read here as [a|c,b|d]
      _logger[method](coloredChunk);
    }

    const length = match[0].length + index;
    if (chunk.length > length) {
      colorChunk(chunk.substring(length));
    }
  };
}
