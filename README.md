# Open

Open is a small, local-first suite of portable creative tools. Clone or download
the repository and use each project independently:

- **Open Slides** — author HTML slide decks and export editable or screenshot
  PowerPoint files. It does not bundle BaoCut or provide a cloud editor.
- **Open Dashboard** — build traceable, offline HTML dashboards from local data.
- **Open Design** — a portable design skill for websites, prototypes, decks,
  diagrams, and other visual work.

Each project has its own README, instructions, examples, dependencies, and
license notices. See the project README before installing it. Upstream and
third-party licenses remain with the files they cover.

To make three separate downloadable ZIPs, run `python3 scripts/package_projects.py`.
The archives appear in `dist/`; generated archives and dependencies are excluded
from future packages.

See [the verification log](docs/verification.md) for the passing test suites and
the reproducible two-slide PPTX export check.

This repository is not affiliated with Anthropic, BaoCut, or the upstream
authors of the included MIT-licensed design materials.

## Projects

| Project | Start here | License boundary |
| --- | --- | --- |
| Open Slides | [slides/README.md](slides/README.md) | Open wrapper: MIT; bundled upstream material and dependencies retain their notices |
| Open Dashboard | [dashboard/README.md](dashboard/README.md) | MIT |
| Open Design | [design/README.md](design/README.md) | Upstream MIT and included third-party notices |
