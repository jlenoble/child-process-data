import {makeIOTest} from '../src/index';
import {expect} from 'chai';

describe(`Testing makeIOTest factory`, function () {
  it(`Default makeIOTest() throws a 'childProcessFile should be defined' error`,
  function () {
    const test = makeIOTest();

    return test().catch(err => {
      expect(err).to.match(/childProcessFile should be defined/);
    });
  });

  it(`makeIOTest({
        childProcessFile: 'build/test/io/readline.js',
      }) throws a 'checkResults callback must be overridden' error`,
  function () {
    const test = makeIOTest({
      childProcessFile: 'build/test/io/readline.js',
    });

    return test().catch(err => {
      expect(err).to.match(/checkResults callback must be overridden/);
    });
  });

  it(`makeIOTest({
        childProcessFile: 'build/test/io/readline.js',
        checkResults: function (results) {...}
      }) is Ok`, function () {
    const test = makeIOTest({
      childProcessFile: 'build/test/io/readline.js',

      checkResults (results) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              const p = results.childProcess;

              p.stdin.write('Hello!\r');
              p.stdin.write('How are you?\r');
              p.stdin.write('Where do you live?\r');
              p.stdin.write('What do you do?\r');

              resolve();
            } catch(err) {
              reject(err);
            }
          }, 300);
        }).then(() => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              try {
                expect(results.outMessages[0]).to.equal(
                  'Hello!\n Hello!\n');
                expect(results.outMessages[1]).to.equal(
                  'How are you?\n Fine!\n');
                expect(results.outMessages[2]).to.equal(
                  'Where do you live?\n On Github.\n');
                expect(results.outMessages[3]).to.equal(
                  'What do you do?\n I dont\'t speak to strings!\n');

                results.childProcess.stdin.write('exit');
                resolve();
              } catch(err) {
                reject(err);
              }
            }, 300);
          });
        });
      },
    });

    return test();
  });

  it(`makeIOTest({
        childProcessFile: 'build/test/io/readline.js',
        io: [...]
      }) is Ok`, function () {
    const test = makeIOTest({
      childProcessFile: 'build/test/io/readline.js',

      messages: [
        {io: ['Hello!', 'Hello!\n Hello!\n']},
        {io: ['How are you?', 'How are you?\n Fine!\n']},
        {io: ['Where do you live?', 'Where do you live?\n On Github.\n']},
        {io: ['What do you do?',
          'What do you do?\n I dont\'t speak to strings!\n']},
        {i: 'exit'},
      ],
    });

    return test();
  });
});
