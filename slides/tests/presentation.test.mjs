import { test } from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';
import { createPresentation } from '../dist/presentation-test.mjs';

const slide = text => ({ rect: { x: 0, y: 0, w: 1280, h: 720 }, root: {
  tag: 'section', rect: { x: 0, y: 0, w: 1280, h: 720 },
  style: { backgroundColor: '#ffffff' }, children: [{
    tag: 'h1', text, rect: { x: 100, y: 100, w: 1000, h: 120 },
    style: { color: '#14243b', fontFamily: 'Arial', fontSize: '64px', fontWeight: '700', lineHeight: '70px' }, children: [],
  }],
} });
test('generated HTML embeds parseable scripts without replacement-string corruption', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
  assert.equal(scripts.length, 2);
  for (const [, source] of scripts) new Script(source);
  assert.doesNotMatch(html, /\{\{DECK_STAGE\}\}|\{\{OPEN_SLIDES_BROWSER\}\}/);
  assert.match(html, /section\{[^}]*color:#14243b/); // Override deck-stage's white inherited text.
});
test('exports two native editable PPTX slides without a browser driver', async () => {
  const { pptx, warnings } = await createPresentation(1280, 720,
    [slide('Hello Open'), slide('Second slide')], async () => []);
  const data = await pptx.write({ outputType: 'uint8array' });
  const zip = await JSZip.loadAsync(data);
  const slides = Object.keys(zip.files).filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name));
  assert.equal(slides.length, 2);
  assert.match(await zip.file(slides[0]).async('string'), /Hello Open/);
  assert.match(await zip.file(slides[1]).async('string'), /Second slide/);
  assert.deepEqual(warnings, []);
});
test('rejects empty decks', async () => {
  await assert.rejects(createPresentation(1280, 720, [], async () => []), /no slides/);
});
test('rejects invalid dimensions', async () => {
  await assert.rejects(createPresentation(0, 720, [slide('One')], async () => []), /positive/);
});
test('does not mutate captured slide source', async () => {
  const captured = slide('One');
  await createPresentation(1280, 720, [captured], async () => []);
  assert.equal(captured.root.style.backgroundColor, '#ffffff');
});
