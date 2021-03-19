const path = require('path');

module.exports = function(yargs) {

  const outDir = yargs.outDir || 'dist';
  const bundle = !!yargs.bundle ? yargs.bundle === 'true' : true;

  return {
    outDir: path.resolve(outDir),
    bundle
  }
}
