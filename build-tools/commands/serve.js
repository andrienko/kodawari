const express = require('express');
const path = require('path');

module.exports = function (argv, config) {
  const folder = path.resolve(__dirname, config.outDir);
  const port = config.port || 80;
  const app = express();
  console.log('serve: trying to serve statics from '+folder+' at http://localhost:'+port);
  app.use(express.static(folder));
  app.listen(port);
}
