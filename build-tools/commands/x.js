const npx = require('node-npx').npxSync;

module.exports = function (argv) {
  for(const arg of argv){
    console.log('x: executing ' + arg);
    npx(arg);
  }
}
