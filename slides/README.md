# Open Slides

English | [简体中文](README.zh-CN.md)

Open a presentation in your own browser, edit text, save a standalone HTML,
click **Export PPTX** for editable PowerPoint, or **Print / PDF** for PDF.
The normal export happens in your current browser: no extra Chromium or cloud
service is needed.

## Install, demo and test

From this directory (Python 3.9+, Node.js 18+):

```sh
python3 install.py                 # optional: install the Agent skill
npm ci                            # JSZip and build tools only; no browser
python3 run.py demo
python3 run.py serve --open
python3 run.py test
```

From the parent repository, first `cd slides`. A separately copied directory
works the same way. For another Agent:
`python3 install.py --destination /path/to/open-slides`.
Existing installs are not overwritten. Alternatively, ask your Agent to read
[AGENTS.md](AGENTS.md) and [SKILL.md](SKILL.md) directly.

## Author and open a deck

Use the static `<deck-stage>` / `<section>` structure and controls in
`examples/browser-deck.html`. The Agent authors that template; the Open browser
export adapter lives in `src/`. The complete MIT upstream stage, capture,
rendering and animation source is under `skills/baoyu-design/`.

The builder combines the template and runtime into `dist/index.html`, a
standalone file that can be opened offline in a modern browser. For Agent
preview, keep `python3 run.py serve` running and open the printed URL.

**Save HTML** downloads the current text and export code. Browser edits do not
silently overwrite the source file. After source edits, rerun the demo build.
`examples/two-slide.html` remains for the optional CLI compatibility check.

## Scope and limitations

This is a local HTML deck and browser export tool, not the complete Claude
Slides cloud editor. It supports text editing, navigation and download, but not
cloud collaboration, server-side saving or arbitrary element drag-layout.

Editable PPTX approximates HTML with native text, shapes, images and supported
animations; arbitrary HTML is not pixel-perfect. Embed fonts/images where
possible. Cross-origin images without CORS permission can fail to export;
inspect warnings. Final fonts, layout and animations should be checked in
PowerPoint or Keynote.

Only when automated batch capture or screenshot PPTX is explicitly needed,
use the [optional CLI](references/export-pptx.md). That separate upstream path
requires Playwright and its browser; ordinary installation does not enable it.

## Source and licenses

Open's adapter, entry points and example use [MIT](LICENSE). The upstream
baoyu-design material by Jim Liu 宝玉 retains `licenses/baoyu-design-MIT.txt`.
Vendored PptxGenJS source, patch notes and license remain intact. JSZip's full
license is in `licenses/jszip-LICENSE.markdown`; bundled dependency notices are
also retained. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
No BaoCut source is included.
