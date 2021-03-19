const runAll = require('npm-run-all');

module.exports = function (argv, config) {
  console.log('run: running tasks '+argv.join('|'));
  runAll(argv, {parallel: false})
}
