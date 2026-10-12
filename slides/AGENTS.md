# Open Slides — Agent instructions

Read SKILL.md and README.md. All required source is inside this directory.

1. One-time build setup: `npm ci` (Node 18+). This does not install Chromium.
2. Run `python3 run.py demo`, then `python3 run.py serve`; open the printed
   loopback URL in the Agent preview or the user's normal browser.
3. Author slide bodies as static `<section>` children of `<deck-stage>` in
   `examples/browser-deck.html`, or create a separate template with the same
   stage and controls. The build combines the template and MIT runtime into
   `dist/index.html`. Do not hand-edit the generated file as the source.
4. Users can edit text, save a self-contained HTML file, export editable PPTX,
   or print to PDF directly in their browser. Save HTML is a download; browser
   edits do not silently overwrite the original source file.
5. Run `python3 run.py test`. Verify navigation, editing, export and at least
   one narrow viewport in a real browser before claiming UI completion.

The browser exporter runs locally inside the already-open browser. No Node
server API, Playwright or separate Chromium is needed for this path. Keep fonts
and images local/embedded for offline sharing; cross-origin images can fail to
export and must be reported. Native PPTX objects approximate HTML; do not claim
pixel-perfect rendering or full Claude Slides editor parity.

Only if the user explicitly needs automated CLI capture or screenshot PPTX,
read references/export-pptx.md. That optional upstream path has a separate
Playwright dependency; do not install it as part of normal use.

Upstream authoring/runtime/export source retains its notices. This Open browser
adapter is new code, not a recovered official Claude editor.
