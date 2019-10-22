const forever = require('forever-monitor');

const child = new forever.Monitor('index.js');

child.on('exit', function () {
  console.log('Server has exited!');
});

child.start();
