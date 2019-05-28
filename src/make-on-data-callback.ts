import chalk from 'chalk';

export default function makeOnDataCallback ({
  format,
  messages,
  allMessages,
  dataCallbacks,
  std,
  silent,
}) {
  return function (data) {
    const str = data.toString(format);
    messages.push(str);
    allMessages.push(str);

    function colorChunk (chunk) {
      if (chunk === '\n') {
        return;
      }

      if (chunk[0] === '\n') {
        return colorChunk(chunk.substring(1));
      }

      let found = false;
      let result;

      dataCallbacks.some(obj => {
        const match = chunk.match(obj.regexp);
        if (match) {
          found = true;
          result = Object.assign(obj.callback(...match), {match});
        }
        return found;
      });

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
