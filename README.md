# child-process-data
A helper to capture data streams from child processes

## Simple usage

Child processes output messages through their stdout and stderr. They get interleaved with messages from other child processes and messages from the parent process.
child-process-data is a [Node.js](https://nodejs.org) module that helps disentangle and recover these messages.

```js
import childProcessData from 'child-process-data';
import {spawn} from 'child_process';

const proc1 = spawn('echo', ['Lorem ipsum']); // Spawns a child process
const proc2 = spawn('echo', ['dolor sit amet']); // Spawns another child process

childProcessData(proc1).then(res => { // Recovers output from proc1
  res.all(); // Returns 'Lorem ipsum\n'
});
childProcessData(proc2).then(res => { // Recovers output from proc2
  res.all(); // Returns 'dolor sit amet\n'
});
```

## Accessing individual messages

To access the output of a child process that exited without errors, you use the ```then``` channel of the promise returned by ```childProcessData```.

Messages output on stdout are contained in array property ```outMessages```. Those on stderr are contained in array property ```errMessages```. They all are contained in order in array property ```allMessages```.

Using file [normal-exit.js](./test/examples/normal-exit.js):

```js
process.stdout.write('lorem\n');
process.stdout.write('ipsum\n');
process.stderr.write('dolor\n');
process.stdout.write('sit\n');
process.stderr.write('amet\n');
```

We can recover all outputs:

```js
childProcessData(spawn('node', ['./test/examples/normal-exit.js'])).then(res => {
  res.outMessages[0] === 'lorem\n'; // true
  res.outMessages[1] === 'ipsum\n'; // true
  res.outMessages[2] === 'sit\n'; // true
  res.errMessages[0] === 'dolor\n'; // true
  res.errMessages[1] === 'amet\n'; // true
  res.allMessages[0] === 'lorem\n'; // true
  res.allMessages[1] === 'ipsum\n'; // true
  res.allMessages[2] === 'dolor\n'; // true
  res.allMessages[3] === 'sit\n'; // true
  res.allMessages[4] === 'amet\n'; // true
});
```

## Accessing all messages

As a conveniency, you can recover messages of a child process that exited without errors as a whole. Methods ```out```, ```err``` and ```all``` return a concatenation respectively of array properties ```outMessages```, ```errMessages``` and ```allMessages```.

```js
childProcessData(spawn('node', ['./test/examples/normal-exit.js'])).then(res => {
  res.out() === 'lorem\nipsum\nsit\n'; // true
  res.err() === 'dolor\namet\n'; // true
  res.all() === 'lorem\nipsum\ndolor\nsit\namet\n'; // true
});
```

## Accessing uncaught error messages

If the child process exits with a non-zero error code, then you recover the output messages using the ```catch``` channel of the promise returned by ```childProcessData```.

The error message printed on screen contains the whole output of the child process, but you can also access all messages through the ```result``` property of the returned error object (it is the object that would have been returned via the ```then``` channel of the promise, had it not failed).

Using file [error-exit.js](./test/examples/error-exit.js):

```js
childProcessData(spawn('node', ['./test/examples/error-exit.js'])).catch(err => {
  let res = err.result;

  res.outMessages[0] === 'lorem\n'; // true
  res.outMessages[1] === 'ipsum\n'; // true
  res.outMessages[2] === 'sit\n'; // true
  res.errMessages[0] === 'dolor\n'; // true
  res.errMessages[1]).match(/Error:.*amet/); // Non empty array
  res.allMessages[0] === 'lorem\n'; // true
  res.allMessages[1] === 'ipsum\n'; // true
  res.allMessages[2] === 'dolor\n'; // true
  res.allMessages[3] === 'sit\n'; // true
  res.allMessages[4]).match(/Error:.*amet/); // Non empty array

  res.out() === 'lorem\nipsum\nsit\n'; // true     
  res.err() === 'dolor\n' + res.errMessages[1]; // true
  res.all() === 'lorem\nipsum\ndolor\nsit\n' + res.allMessages[4]; // true
});
```

## License

child-process-data is [MIT licensed](./LICENSE).

© 2016-2017 [Jason Lenoble](mailto:jason.lenoble@gmail.com)
