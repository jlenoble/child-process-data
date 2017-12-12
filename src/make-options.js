import chalk from 'chalk';

export default function makeOptions (opts, childProcessData) {
  const options = Object.assign({
    format: 'utf-8',
    dataCallbacks: {
      '(Starting) \'(\\w+([-:_]\\w+)*)\'\\.\\.\\.': (match, action, task) => {
        options.dataUp();
        return {
          coloredChunk: `${action} '${chalk.cyan(task)}'...`,
          logger: [console, 'log'],
        };
      },
      '(Finished) \'(\\w+([-:_]\\w+)*)\' after (\\d+\\.?\\d* m?s)': (match,
        action, task, ...duration) => {
        options.dataDown();
        return {
          coloredChunk: `${action} '${chalk.cyan(task)}' after ${chalk.magenta(
            duration[duration.length -1])}`,
          logger: [console, 'log'],
        };
      },
      '\\[(\\d\\d:\\d\\d:\\d\\d)\\]': match => {
        return {
          coloredChunk: `${chalk.gray(match)}`,
          logger: [process.stdout, 'write'],
        };
      },
      '(Working directory changed to|Using gulpfile) (.+)': (match,
        action, path) => {
        return {
          coloredChunk: `${action} ${chalk.magenta(path)}`,
          logger: [console, 'log'],
        };
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
    silent: childProcessData.silent,
  }, opts);

  return options;
}
