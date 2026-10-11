---
name: open-dashboard
description: Build local interactive data dashboards from CSV, spreadsheets or analysis outputs, with traceable numbers, filters, light/dark charts, sortable tables and a single offline HTML. Use for 数据看板, Dashboard, 数据分析可视化, or requests to follow a portable dashboard workflow. Independently implemented; not recovered Claude code.
---

# Data Dashboard

Create a useful analytical report, not a decorative collection of charts.
Use the bundled zero-dependency runtime; deliver an HTML containing its data,
CSS and JS. Treat this folder as `SKILL_ROOT`, wherever it is installed.

## Follow the five-step workflow

1. **Profile.** Read `references/analysis.md`; inspect supplied data with
   `python3 "$SKILL_ROOT/scripts/profile_data.py" input.csv --output profile.json`.
   Confirm grain, units, time window, missingness, duplicates, joins and export
   time. Do not treat an ID as a measure, silently fill nulls, or invent data.
   If only an example is wanted, label synthetic data prominently.
2. **Analyze.** Use pandas for repeatable analyses (for example,
   `uv run --with pandas python analysis.py`). Preserve source CSVs and write
   down the business definitions. Validate sums, denominators and join row
   counts independently. The runtime is deliberately not a pandas substitute.
   Derive recommendations from actual evidence; keep inference separate.
3. **Author.** Read `references/charts.md`, `references/design.md` and
   `references/runtime.md`. Copy `assets/template.html` to a report page;
   write `dashboard.json` with sources, declarative calcs and charts. Bind every
   business number using `data-calc`; use `data-chart` for charts/tables.
   Include Sources and limitations. Convert spreadsheet inputs to CSV locally;
   do not claim this runtime reads XLSX directly.
4. **Inspect and package.** Build and check:
   ```sh
   python3 "$SKILL_ROOT/scripts/build.py" page.html dashboard.json dashboard.html
   python3 "$SKILL_ROOT/scripts/check.py" dashboard.html
   ```
   Open a loopback preview in the in-app browser, not a public server. Verify
   filters update KPI/chart/table together, sorting, tooltips, provenance,
   theme, keyboard access, desktop and mobile. Use `scripts/smoke.py` for an
   independent headless test when the environment permits it; read its `--help`.
   It serves ONLY the supplied trusted HTML over loopback, blocks external
   requests, saves light/dark/mobile screenshots and reports failures. Do not
   use it to bypass browser safety policy or operate a signed-in profile.
5. **Deliver.** Link the generated HTML and verified screenshots. Report the
   actual checks and omissions. Explain that the HTML embeds source data:
   hidden columns are still present. Redact/aggregate sensitive inputs before
   building; get explicit permission before sharing externally. State whether
   data is real, supplied, derived, or synthetic. Never label this as official
   Claude Dashboard or recovered hidden prompts.

## Use the examples

- `examples/sample/page.html`, `dashboard.json`, `sample.csv`: minimal synthetic
  subscription report. `analyze.py` independently recomputes its pandas results.
- `examples/sample/gallery.html`: all chart families, using the same sample.

## Keep the boundaries honest

- Support sum/mean/min/max/count, ratios, equality filters, line/bar/stack/
  mini-list/funnel and tables. Do not promise arbitrary formulas, joins,
  live connections, a drag-and-drop editor or cloud collaboration.
- Join/clean/aggregate externally and save a new CSV with a documented lineage
  when needed. Preserve raw files. CSV record numbers include the header and
  are not physical line numbers when quoted fields contain newlines.
- Source-panel calculations use the SAME selected records as visible numbers.
  Null aggregates and division by zero display `暂无数据`; true zero stays zero.
  Reject malformed CSV and nonnumeric measures rather than guessing.
- Render user values as text. Use trusted HTML templates; never execute scripts
  from arbitrary downloaded dashboards. Do not add CDN/font/network dependencies.
- REA is installed separately for lawful static source inspection. It is not
  needed to generate a dashboard; missing official sources are not a blocker
  for this independent implementation.
