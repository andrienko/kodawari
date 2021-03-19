const path = require('path');
const del = require('del').sync;

const getConfig = function(yargs) {

  const outDir = yargs.outDir || 'dist';
  const bundle = !!yargs.bundle ? yargs.bundle === 'true' : true;

  return {
    outDir: path.resolve(outDir),
    bundle
  }
}

const cleanFolder = function(folderName ){
  const delGlob = path.resolve(folderName, '*');
  console.log('clean: deleting everything at ' + delGlob);
  del(delGlob);
}

module.exports = { getConfig, cleanFolder };
