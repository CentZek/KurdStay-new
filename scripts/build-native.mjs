import { build } from 'esbuild';
await build({entryPoints:['src/native.js'],bundle:true,format:'iife',platform:'browser',target:['chrome110'],outfile:'dist/native.js',minify:true,legalComments:'eof'});
console.log('Native bridge built. Web assets are ready in dist/.');
