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
        expect(res.all()).to.equal('Little silly message\n');
        expect(res.multiTest([
          msg => msg.includes('Little'),
          msg => msg.includes('silly'),
          msg => msg.includes('message'),
        ])).to.be.true;
        expect(res.multiTest([
          msg => msg.includes('Little'),
          msg => msg.includes('silly'),
          msg => msg.includes('email'),
        ])).to.be.false;
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
});
