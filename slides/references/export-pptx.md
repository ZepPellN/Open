# Optional automated CLI export

This is the upstream headless automation/screenshot path. It is not needed
to click Export PPTX in the Open Slides browser example. Read README.md first;
do not install its Chromium dependency during ordinary setup.

Build the bundled exporter once:

```sh
cd slides/skills/baoyu-design/agents/gen-pptx
npm ci
npx playwright install chromium
npm run build
```

From the repository root, serve only the folder containing your trusted deck on
loopback (keep this terminal running):

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory /absolute/path/to/deck-folder
```

Create a JSON config for the deck. For an HTML page whose slides are `.slide`
elements and use the `goToSlide(index)` navigation function:

```json
{
  "width": 1280,
  "height": 720,
  "slides": [
    { "showJs": "goToSlide(0)", "selector": ".slide.active" },
    { "showJs": "goToSlide(1)", "selector": ".slide.active" }
  ],
  "filename": "presentation"
}
```

Then, from the repository root:

```sh
node slides/skills/baoyu-design/agents/gen-pptx/dist/cli.mjs \
  --url http://127.0.0.1:8765/deck.html \
  --config /absolute/path/to/export.json \
  --out /absolute/path/to/output
```

The default editable mode writes native PowerPoint objects. Add
`"mode": "screenshots"` only when a static, pixel-matched deck is preferred.
Inspect the CLI's validation output and open the result in PowerPoint for final
review. The browser may need network access for remote fonts/images referenced
by the source deck; local self-contained assets are more reproducible.
