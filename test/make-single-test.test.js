import {makeSingleTest} from '../src/child-process-data';
import {expect} from 'chai';

describe(`Testing makeSingleTest factory`, function () {

  it(`Default makeSingleTest() throws a 'Not a ChildProcess instance' error`,
  function () {
    const test = makeSingleTest();
    return test().catch(err => {
      expect(err).to.match(/Not a ChildProcess instance/);
    });
  });

  it(`makeSingleTest({
        childProcess: ['echo', ['Hello', 'World!']]
      }) throws a 'checkResults callback must be overridden' error`, function () {
    const test = makeSingleTest({
      childProcess: ['echo', ['Hello', 'World!']]
    });
    return test().catch(err => {
      expect(err).to.match(/checkResults callback must be overridden/);
    });
  });

  it(`makeSingleTest({
        childProcess: ['echo', ['Hello', 'World!']],
        checkResults: function (results) {
          expect(results.out()).to.equal('Hello World!\\n');
        }
      })  `, function () {
    const test = makeSingleTest({
      childProcess: ['echo', ['Hello', 'World!']],
      checkResults: function (results) {
        expect(results.out()).to.equal('Hello World!\n');
      }
    });
    return test();
  });

});
