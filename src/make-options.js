import chalk from 'chalk';

export default function makeOptions (opts) {
  const options = Object.assign({
    format: 'utf-8',
    dataCallbacks: {
      '(Starting) \'(\\w+([:-_]\\w+)*)\'\\.\\.\\.': (match, action, task) => {
        console.log(`${action} '${chalk.cyan(task)}'...`);
        options.dataUp();
      },
      '(Finished) \'(\\w+([:-_]\\w+)*)\' after (\\d+\\.?\\d* m?s)': (match,
        action, task, ...duration) => {
        console.log(
          `${action} '${chalk.cyan(task)}' after ${chalk.magenta(
            duration[duration.length -1])}`);
        options.dataDown();
      },
      '\\[(\\d\\d:\\d\\d:\\d\\d)\\]': match => {
        process.stdout.write(`${chalk.gray(match)} `);
      },
      '(Working directory changed to|Using gulpfile) (.+)': (match,
        action, path) => {
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
