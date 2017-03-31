import childProcessData from '../src/child-process-data';
import {spawn} from 'child_process';
import {expect} from 'chai';

describe('Testing childProcessData', function () {
  const echo = (...args) => {
    return childProcessData(spawn('echo', args));
  };

  const node = (...args) => {
    return childProcessData(spawn('node', args));
  };

  it(`childProcessData can forget buffered messages`, function () {
    return Promise.all([
      echo('Little silly message').then(res => {
        expect(res.all()).to.equal('Little silly message\n');
        res.forget();
        expect(res.all()).to.equal('');
      }),
      echo('Another little silly message').then(res => {
        expect(res.all()).to.equal('Another little silly message\n');
        res.forget();
        expect(res.all()).to.equal('');
      }),
    ]);
  });

  it(`childProcessData can forget messages up to a point`, function () {
    return Promise.all([
      node('./test/examples/normal-exit.js').then(res => {
        expect(res.out()).to.equal('lorem\nipsum\nsit\n');
        expect(res.err()).to.equal('dolor\namet\n');
        res.forgetUpTo('dolor\n', {included: true});
        expect(res.out()).to.equal('sit\n');
        expect(res.err()).to.equal('amet\n');
        expect(res.allMessages).to.have.length(2);
      }),
      node('./test/examples/error-exit.js').catch(err => {
        const res = err.result;
        expect(res.out()).to.equal('lorem\nipsum\nsit\n');
        expect(res.err()).to.equal('dolor\n' + res.errMessages[1]);
        res.forgetUpTo('dolor\n');
        expect(res.out()).to.equal('sit\n');
        expect(res.err()).to.equal('dolor\n' + res.errMessages[1]);
        expect(res.allMessages).to.have.length(3);
      }),
    ]);
  });
});
