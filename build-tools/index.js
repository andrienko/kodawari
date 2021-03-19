const path = require('path');
const fs = require('fs');


const { hideBin } = require('yargs/helpers')
const yargs = require('yargs/yargs')(hideBin(process.argv)).argv;
const config = require('./config')(yargs);

const argv = yargs._;

console.log('kbuild invoked with "' + argv.join(' ') + '"');

if(argv[0]){
    const commandFileName = path.resolve(__dirname, 'commands/' + argv[0] + '.js');
    if(fs.existsSync(commandFileName)){
        console.log('Running ' + argv[0] + ' from ' + commandFileName);
        const command = require(commandFileName);
        command(argv.slice(1), config, yargs);
    }
}


