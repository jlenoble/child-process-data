import readline from 'readline';

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

const messages = {
  'Hello!': 'Hello!',
  'How are you?': 'Fine!',
  'Where do you live?': 'On Github.',
  'What do you do?': 'I dont\'t speak to strings!',
};

let blah = '';
process.stdin.on('keypress', (str, key) => {
  if (key.sequence === '\r') {
    console.log(blah + '\n', messages[blah]);
    blah = '';
  } else {
    blah += key.sequence;
  }
});
