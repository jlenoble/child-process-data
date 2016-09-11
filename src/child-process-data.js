import {spawn} from 'child_process';
import chalk from 'chalk';

const ChildProcess = spawn('true').constructor;

function childProcessData(childProcess, options) {
  options = Object.assign({
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
      }
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
    }
  }, options);

  var dataCallbacks = [];
  Object.keys(options.dataCallbacks).forEach(key => {
    dataCallbacks.push({
      pattern: key,
      regexp: new RegExp(key),
      callback: options.dataCallbacks[key]
    });
  });

  var p = childProcess;
  var outMessages = [];
  var errMessages = [];
  var allMessages = [];

  if (!(p instanceof ChildProcess)) {
    throw new TypeError('Not a ChildProcess instance ' + p);
  }

  if (!p.stdout) {
    throw new ReferenceError('Undefined child process stdout');
  }

  if (!p.stderr) {
    throw new ReferenceError('Undefined child process stderr');
  }

  var promise = new Promise((resolve, reject) => {

    options.result = {
      childProcess, outMessages, errMessages, allMessages,
      out() {
        return this.outMessages.join('');
      },
      err() {
        return this.errMessages.join('');
      },
      all() {
        return this.allMessages.join('');
      }
    };
    options.resolve = () => {
      resolve(options.result);
    };
    options.reject = reject;

    p.stdout.on('data', function(data) {
      const str = data.toString(options.format);
      outMessages.push(str);
      allMessages.push(str);

      var found = false;

      dataCallbacks.some(obj => {
        var res = str.match(obj.regexp);
        if (res) {
          found = true;
          obj.callback(res[1], res[2], res[3], res[4]);
        }
        return found;
      });

      if (!found) {
        process.stdout.write(chalk.yellow(str));
      }
    });

    p.stderr.on('data', function(data) {
      const str = data.toString(options.format);
      errMessages.push(str);
      allMessages.push(str);
    });

    const callback = function(code) {
      if (!code) {
        resolve(options.result);
      } else {
        reject(new Error(`child process stream closed with code ${code}
>>>>stdout buffer
${outMessages.join('')}<<<<end stdout buffer
>>>>stderr buffer
${errMessages.join('')}<<<<end stderr buffer
>>>>dual buffer
${allMessages.join('')}<<<<end dual buffer`));
      }
    };

    p.on('close', callback);

  });

  return promise;
}

export default childProcessData;
