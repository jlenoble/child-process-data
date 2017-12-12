import childProcessData from '../src/index';
import {spawn} from 'child_process';
import {expect} from 'chai';

describe('Testing childProcessData', function () {
  const echo = (...args) => {
    return childProcessData(spawn('echo', args));
  };

  const node = (...args) => {
    return childProcessData(spawn('node', args));
  };

  it(`childProcessData can test buffered messages`, function () {
    return Promise.all([
      echo('Little silly message').then(res => {
        expect(res.all()).to.equal('Little silly message\n');
        expect(res.test(msg => msg === 'Little silly message\n')).to.be.true;
      }),
      echo('Another little silly message').then(res => {
        expect(res.all()).to.equal('Another little silly message\n');
        expect(res.test(msg => msg === 'Another little silly message\n'))
          .to.be.true;
      }),
    ]);
  });

  it(`childProcessData can multi-test buffered messages`, function () {
    return Promise.all([
      echo('Little silly message').then(res => {
        function make (str) {
          return msg => msg.includes(str);
        }
        function* good () {
          const a = ['Little', 'silly', 'message'].map(make);
          yield* a;
        }
        function* bad () {
          const a = ['Little', 'silly', 'email'].map(make);
          yield* a;
        }

        expect(res.all()).to.equal('Little silly message\n');
        expect(res.multiTest([...good()])).to.be.true;
        expect(res.multiTest([...bad()])).to.be.false;
      }),
    ]);
  });

  it(`childProcessData can test messages up to a point`, function () {
    return Promise.all([
      node('./test/examples/normal-exit.js').then(res => {
        expect(res.all()).to.equal('lorem\nipsum\ndolor\nsit\namet\n');
        expect(res.testUpTo(msg => {
          return !msg.includes('sit');
        }, 'dolor')).to.be.true;
        expect(res.testUpTo(msg => {
          return !msg.includes('ipsum');
        }, 'dolor')).to.be.false;
        expect(res.testUpTo(msg => {
          return !msg.includes('dolor');
        }, 'dolor')).to.be.true;
        expect(res.testUpTo(msg => {
          return !msg.includes('ip');
        }, 'sum')).to.be.false;
      }),
    ]);
  });

  it(`childProcessData can multi-test messages up to a point`, function () {
    return Promise.all([
      node('./test/examples/normal-exit.js').then(res => {
        function make (str) {
          return msg => !msg.includes(str);
        }
        function* good () {
          const a = ['sit', 'dolor'].map(make);
          yield* a;
        }
        function* bad () {
          const a = ['sit', 'dolor', 'ipsum'].map(make);
          yield* a;
        }

        expect(res.all()).to.equal('lorem\nipsum\ndolor\nsit\namet\n');
        expect(res.testUpTo([...good()], 'dolor')).to.be.true;
        expect(res.testUpTo([...bad()], 'dolor')).to.be.false;
      }),
    ]);
  });

  it(`childProcessData can multi-test messages up to a point, included`,
    function () {
      return Promise.all([
        node('./test/examples/normal-exit.js').then(res => {
          function make (str) {
            return msg => !msg.includes(str);
          }
          function* good () {
            const a = ['sit', 'amet'].map(make);
            yield* a;
          }
          function* bad () {
            const a = ['sit', 'dolor'].map(make);
            yield* a;
          }

          expect(res.all()).to.equal('lorem\nipsum\ndolor\nsit\namet\n');
          expect(res.testUpTo([...good()], 'dolor', {included: true}))
            .to.be.true;
          expect(res.testUpTo([...bad()], 'dolor', {included: true}))
            .to.be.false;
        }),
      ]);
    });

  it(`multi-test messages up to a point, included - special chars`,
    function () {
      return Promise.all([
        node('./test/examples/queue-bugfix.js').then(res => {
          function make (str) {
            return msg => !msg.includes(str);
          }
          function* good () {
            const a = [
              `Task 'transpile' (DST): tmp/src/gulptask.js`,
              `Task 'transpile' (NWR): 1 item`,
              `Task 'transpile' (DST): 1 item`,
              `Finished 'transpile' after 150 ms`,
              `Finished 'exec:transpile' after 150 ms`,
              `Finished 'default' after 150 ms`,
            ].map(make);
            yield* a;
          }
          function* bad () {
            const a = [
              `Task 'transpile' (DST): tmp/src/gulptask.js`,
              `Task 'transpile' (NWR): 1 item`,
              `Task 'transpile' (DST): 1 item`,
              `Task 'transpile' (NWR): tmp/src/gulptask.js`,
              `Finished 'transpile' after 150 ms`,
              `Finished 'exec:transpile' after 150 ms`,
              `Finished 'default' after 150 ms`,
            ].map(make);
            yield* a;
          }

          expect(res.all()).to.equal(`Starting 'default'...
Starting 'exec:transpile'...
Starting 'exec:copy'...
Task 'copy' (SRC): src/gulptask.js
Task 'copy' (SRC): 1 item
Task 'copy' (NWR): src/gulptask.js
Task 'copy' (NWR): 1 item
Finished 'exec:copy' after 150 ms
Starting 'transpile'...
Task 'transpile' (SRC): tmp/src/gulptask.js
Task 'transpile' (SRC): 1 item
Task 'transpile' (NWR): tmp/src/gulptask.js
Task 'transpile' (DST): tmp/src/gulptask.js
Task 'transpile' (NWR): 1 item
Task 'transpile' (DST): 1 item
Finished 'transpile' after 150 ms
Finished 'exec:transpile' after 150 ms
Finished 'default' after 150 ms
`);
          expect(res.testUpTo([...good()],
            `Task 'transpile' (NWR): tmp/src/gulptask.js`, {included: true}))
            .to.be.true;
          expect(res.testUpTo([...bad()],
            `Task 'transpile' (NWR): tmp/src/gulptask.js`, {included: true}))
            .to.be.false;
        }),
      ]);
    });
});
