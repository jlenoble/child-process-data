import chalk from 'chalk';

export default function makeOptions (opts) {
  const options = Object.assign({
    format: 'utf-8',
    dataCallbacks: {
      '(Starting) \'(\\w+)\'\\.\\.\\.': (action, task) => {
        console.log(`${action} '${chalk.cyan(task)}'...`);
        options.dataUp();
      },
      '(Finished) \'(\\w+)\' after (\\d+\\.?\\d* m?s)': (action, task,
        duration) => {
        console.log(
          `${action} '${chalk.cyan(task)}' after ${chalk.magenta(duration)}`);
        options.dataDown();
      },
      '\\[(\\d\\d:\\d\\d:\\d\\d)\\]': time => {
        process.stdout.write(`[${chalk.gray(time)}] `);
      },
      '(Working directory changed to|Using gulpfile) (.+)': (action, path) => {
        console.log(`${action} ${chalk.magenta(path)}`);
      },
    },
    dataLevel: 0,
    dataUp: () => {
      options.dataLevel++;
    },
    dataDown: () => {
      options.dataLevel--;
      if (!options.dataLevel) {
        options.resolve();
      }
    },
  }, opts);

  return options;
}
