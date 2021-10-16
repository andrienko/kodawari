const path = require('path');
const fs = require('fs');

const helpers = require('./helpers');
const { hideBin } = require('yargs/helpers')
const yargs = require('yargs/yargs')(hideBin(process.argv)).argv;
const config = helpers.getConfig(yargs);

const argv = yargs._;

console.log('kbuild invoked with "' + argv.join(' ') + '"');

if(yargs.clean){
  const folderToClean = yargs.clean === true ? config.outDir : yargs.clean;
  helpers.cleanFolder(folderToClean)
}

if(argv[0]){
    const commandFileName = path.resolve(__dirname, 'commands/' + argv[0] + '.js');
    if(fs.existsSync(commandFileName)){
        console.log('Running ' + argv[0] + ' from ' + commandFileName);
        const command = require(commandFileName);
        command(argv.slice(1), config, yargs);
    } else {
      console.error('Command not found: ' + commandFileName + ' does not exist.');
    }
}


