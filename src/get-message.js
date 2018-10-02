import childProcessData from './child-process-data';

const messages = new Map();
const interval = 500;
const panicTime = 10000;

export function clearMessages () {
  messages.clear();
}

function toRegExp (msg) {
  let regex = msg;

  if (!(regex instanceof RegExp)) {
    regex = new RegExp(msg.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  }

  return regex;
}

export async function interceptMessage (proc, msg = '', options = {}) {
  const regex = toRegExp(msg);
  const key = regex.source;
  const opts = Object.assign({
    dontBlock: true,
    listenTime: 30000,
    startDelay: 1,
    endDelay: 1,
  }, options);

  const results = childProcessData(proc, opts).results;
  const countdown = Math.max(1, Math.ceil(opts.listenTime / interval));
  const lastCountdown = Math.max(1, Math.ceil(opts.endDelay / interval));

  messages.set(key, {results, countdown, lastCountdown});
}

export function resolveMessage (msg) {
  const regex = toRegExp(msg);
  const key = regex.source;
  let attempts = Math.ceil(panicTime / interval);
  let countdown;
  let lastCountdown;

  const fn = function () {
    return Promise.resolve().then(() => {
      let {results} = messages.get(key) || {};

      if (results) {
        if (countdown === undefined) {
          countdown = messages.get(key).countdown || 1;
          lastCountdown = messages.get(key).lastCountdown || 1;
        }

        if (results.all().match(regex) || !(--countdown)) {
          if (countdown) {
            console.log(`Intercepted message ${regex}`);
          } else {
            throw new Error(`Failed to intercept ${regex}`);
          }

          if (--lastCountdown) {
            return new Promise((resolve, reject) => {
              setTimeout(() => fn().then(resolve, reject), interval);
            });
          }

          return;
        }
      } else {
        attempts--;

        if (!attempts) {
          throw new Error(`Message ${regex} still unregistered after ${
            panicTime / 1000}s`);
        }
      }

      return new Promise((resolve, reject) => {
        setTimeout(() => fn().then(resolve, reject), interval);
      });
    }).catch(err => {
      console.error(err.message);
      return err; // Don't throw but allow handling down the line
    });
  };

  Object.defineProperty(fn, 'name', {value: `Waiting for message "${
    key.slice(0, 30) + '...'}"`});

  return fn;
}
