const express = require('express');
const path = require('path');

module.exports = function (argv, config) {
  const folder = path.resolve(__dirname, config.outDir);
  console.log('serve: trying to serve statics from '+folder);

  const app = express();
  app.use(express.static(folder));
  app.listen(80);
}
