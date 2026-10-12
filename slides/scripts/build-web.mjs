import { build } from 'esbuild';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const upstream = path.join(root, 'skills/baoyu-design/agents/gen-pptx');
await mkdir(path.join(root, 'dist'), { recursive: true });
const result = await build({
  absWorkingDir: root, entryPoints: ['src/browser.ts'], bundle: true, write: false,
  platform: 'browser', target: 'es2022', format: 'iife', minify: true,
  define: { require: 'undefined', process: 'undefined' },
  external: ['node:fs/promises', 'node:https', 'node:http'],
  legalComments: 'inline',
});
const template = await readFile(path.join(root, 'examples/browser-deck.html'), 'utf8');
const stage = await readFile(path.join(upstream, '../..', 'starter-components/deck-stage.js'), 'utf8');
const safeScript = text => text.replaceAll('</script', '<\\/script');
// Replacement callbacks preserve literal $&, $' and $` in embedded source.
const html = template.replace('{{DECK_STAGE}}', () => safeScript(stage))
  .replace('{{OPEN_SLIDES_BROWSER}}', () => safeScript(result.outputFiles[0].text));
await writeFile(path.join(root, 'dist/index.html'), html);
if (process.argv.includes('--tests')) await build({
  absWorkingDir: root, entryPoints: ['src/presentation.ts'], bundle: true,
  platform: 'node', target: 'node18', format: 'esm', outfile: 'dist/presentation-test.mjs',
  external: ['jszip'], logLevel: 'warning',
});
console.log('Built dist/index.html: standalone browser deck, no Chromium dependency.');
