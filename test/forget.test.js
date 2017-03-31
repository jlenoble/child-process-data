import childProcessData from '../src/child-process-data';
import {spawn} from 'child_process';
import {expect} from 'chai';

describe('Testing childProcessData', function () {
  const echo = (...args) => {
    return childProcessData(spawn('echo', args));
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
});
