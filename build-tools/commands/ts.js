const ESBuild = require('esbuild');
const NodeResolve = require('@esbuild-plugins/node-resolve').default;

module.exports = function (argv, config) {
    console.log('ts: building '+argv[0]+ ' to ' + config.outDir);

    ESBuild.build({
      entryPoints: [argv[0]],
      plugins: [
        NodeResolve({
          extensions: ['.ts', '.js'],
          onResolved: (resolved) => {
            if (resolved.includes('node_modules')) {
              return {
                external: true,
              }
            }
            return resolved
          },
        }),
      ],
      write: true,
      outdir: config.outDir,
      bundle: config.bundle,
      platform: 'node'
    })
}
