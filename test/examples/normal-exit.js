const out = (msg, n) => {
  setTimeout(process.stdout.write.bind(process.stdout), n, msg);
};
const err = (msg, n) => {
  setTimeout(process.stderr.write.bind(process.stderr), n, msg);
};

out('lorem\n', 10);
out('ipsum\n', 20);
err('dolor\n', 30);
out('sit\n', 40);
err('amet\n', 50);
