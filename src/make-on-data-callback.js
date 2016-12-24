import chalk from 'chalk';

export default function makeOnDataCallback (
  format,
  messages,
  allMessages,
  dataCallbacks,
  std
) {
  return function (data) {
    const str = data.toString(format);
    messages.push(str);
    allMessages.push(str);

    let found = false;

    dataCallbacks.some(obj => {
      const res = str.match(obj.regexp);
      if (res) {
        found = true;
        obj.callback(res[1], res[2], res[3], res[4]);
      }
      return found;
    });

    if (!found) {
      process[std].write(chalk.yellow(str));
    }
  };
}
