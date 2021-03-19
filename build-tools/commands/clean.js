const del = require('del');
const path = require('path');

module.exports = function (argv, config) {
    const delGlob = path.resolve(config.outDir, '*');
    console.log('clean: deleting everything at ' + delGlob);
    del(delGlob);
}