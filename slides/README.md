# Open Slides

Open Slides is a local HTML slide-authoring workflow with editable and
pixel-perfect screenshot PPTX export. It uses the MIT-licensed deck guidance
and exporter included here; it does **not** include BaoCut code or its license,
and is not a clone of BaoCut's interactive editor or a cloud Slides service.

## Install the skill

Copy this project directory into your agent's skills folder as `open-slides`.
For Codex:

```sh
mkdir -p ~/.agents/skills/open-slides/skills/baoyu-design ~/.agents/skills/open-slides/references ~/.agents/skills/open-slides/examples ~/.agents/skills/open-slides/licenses
cp SKILL.md README.md LICENSE THIRD_PARTY_NOTICES.md ~/.agents/skills/open-slides/
cp references/export-pptx.md ~/.agents/skills/open-slides/references/
cp examples/two-slide.html examples/two-slide-export.json ~/.agents/skills/open-slides/examples/
cp licenses/baoyu-design-MIT.txt licenses/pptxgenjs-LICENSE.txt ~/.agents/skills/open-slides/licenses/
rsync -a --exclude='node_modules/' --exclude='dist/' skills/baoyu-design/ ~/.agents/skills/open-slides/skills/baoyu-design/
```

Reload the agent, then ask it to create a deck. The skill entry point is
[`SKILL.md`](SKILL.md); it guides the agent through authoring a navigable HTML
deck using the included deck-stage component.

## Build the PowerPoint exporter

Requirements: Node.js 18 or newer, npm, and Playwright's Chromium browser.

```sh
cd slides/skills/baoyu-design/agents/gen-pptx
npm ci
npx playwright install chromium
npm run build
npm test
```

The editable PPTX exporter reads a deck served from loopback and writes the
result to an output directory. Follow [`references/export-pptx.md`](references/export-pptx.md)
for a two-slide example and JSON configuration. Screenshot export is also
available, but produces non-editable image slides.

## License and provenance

The Open Slides wrapper and original example are MIT; see [LICENSE](LICENSE).
The bundled deck workflow and exporter originate from baoyu-design and retain
its MIT license in `licenses/baoyu-design-MIT.txt`. The vendored PptxGenJS
source retains its own license. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
