import chalk from "chalk";

export default function makeOnDataCallback({
  format,
  messages,
  _allMessages,
  dataCallbacks,
  std,
  silent
}: DataCallbackOptions): (data: string) => void {
  return function(data): void {
    const str = data.toString(format);
    messages.push(str);
    _allMessages.push(str);

    function colorChunk(chunk): void {
      if (chunk === "\n") {
        return;
      }

      if (chunk[0] === "\n") {
        return colorChunk(chunk.substring(1));
      }

      let found = false;
      let result;

      dataCallbacks.some(
        (obj): boolean => {
          const match = chunk.match(obj.regexp);
          if (match) {
            found = true;
            result = Object.assign(obj.callback(match), { match });
          }
          return found;
        }
      );

      if (!found) {
        if (!silent) {
          process[std].write(chalk.yellow(chunk));
        }
        return;
      }

      const [logger, method] = result.logger;

      if (result.match.index > 0) {
        colorChunk(chunk.substring(0, result.match.index));
      }

      if (!silent) {
        logger[method](result.coloredChunk);
      }

      const length = result.match[0].length + result.match.index;
      if (chunk.length > length) {
        colorChunk(chunk.substring(length));
      }
    }

    colorChunk(str);
  };
}
