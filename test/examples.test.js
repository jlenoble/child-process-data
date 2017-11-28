import childProcessData from '../src/index';
import {spawn} from 'child_process';
import {expect} from 'chai';

describe('Testing README.md examples', function () {
  it(`Testing 'Simple usage' example`, function () {
    const proc1 = spawn('echo', ['Lorem ipsum']); // Spawns a child process
    const proc2 = spawn('echo', ['dolor sit amet']); // Spawns another child
    // process

    return Promise.all([
      childProcessData(proc1).then(res => { // Recovers output from proc1
        expect(res.all()).to.equal('Lorem ipsum\n');
      }),
      childProcessData(proc2).then(res => { // Recovers output from proc2
        expect(res.all()).to.equal('dolor sit amet\n');
      })]);
  });

  it(`Testing 'Accessing individual messages' example`, function () {
    return childProcessData(spawn('node', [
      './test/examples/normal-exit.js'])).then(res => {
      expect(res.outMessages[0]).to.equal('lorem\n');
      expect(res.outMessages[1]).to.equal('ipsum\n');
      expect(res.outMessages[2]).to.equal('sit\n');
      expect(res.errMessages[0]).to.equal('dolor\n');
      expect(res.errMessages[1]).to.equal('amet\n');
      expect(res.allMessages).to.include('lorem\n');
      expect(res.allMessages).to.include('ipsum\n');
      expect(res.allMessages).to.include('dolor\n');
      expect(res.allMessages).to.include('sit\n');
      expect(res.allMessages).to.include('amet\n');
    });
  });

  it(`Testing 'Accessing all messages' example`, function () {
    return childProcessData(spawn('node', [
      './test/examples/normal-exit.js'])).then(res => {
      expect(res.out()).to.equal('lorem\nipsum\nsit\n');
      expect(res.err()).to.equal('dolor\namet\n');
      ['lorem\n', 'ipsum\n', 'dolor\n', 'sit\n', 'amet\n'].forEach(word => {
        expect(res.all()).to.match(new RegExp(word));
      });
    });
  });

  it(`Testing 'Accessing uncaught error messages' example`, function () {
    return childProcessData(spawn('node', [
      './test/examples/error-exit.js'])).catch(_err => {
      let res = _err.result;

      expect(res.outMessages[0]).to.equal('lorem\n');
      expect(res.outMessages[1]).to.equal('ipsum\n');
      expect(res.outMessages[2]).to.equal('sit\n');
      expect(res.errMessages[0]).to.equal('dolor\n');
      expect(res.errMessages[1]).to.match(/Error:.*amet/);
      expect(res.allMessages[0]).to.equal('lorem\n');
      expect(res.allMessages[1]).to.equal('ipsum\n');
      expect(res.allMessages[2]).to.equal('dolor\n');
      expect(res.allMessages[3]).to.equal('sit\n');
      expect(res.allMessages[4]).to.match(/Error:.*amet/);

      expect(res.out()).to.equal('lorem\nipsum\nsit\n');
      expect(res.err()).to.equal('dolor\n' + res.errMessages[1]);
      expect(res.all()).to.equal('lorem\nipsum\ndolor\nsit\n' +
        res.allMessages[4]);
    });
  });
});
