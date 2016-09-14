process.stdout.write('lorem\n');
process.stdout.write('ipsum\n');
process.stderr.write('dolor\n');
process.stdout.write('sit\n');
throw new Error('amet\n');
