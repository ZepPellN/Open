# Open Dashboard

English | [简体中文](README.zh-CN.md)

An independent local dashboard builder inspired by the workflow in the
source post's fourth image. It is not recovered Claude source or the author's
unpublished skill attachment.

## Install, demo and test

From this directory (Python 3.9+; Node.js 18+ for tests):

```sh
python3 install.py
python3 run.py demo
python3 run.py serve --open
python3 run.py test
```

The default skill destination is `~/.agents/skills/open-dashboard`.
Use `--destination /path/to/open-dashboard` for another Agent; an existing
directory is never overwritten. Or read [AGENTS.md](AGENTS.md) and
[SKILL.md](SKILL.md) directly. From the parent repository, first `cd dashboard`.

The demo builds `dist/index.html`. Preview binds only to loopback and prints
its URL; `--open` opens your default browser. The HTML is self-contained and
also works offline in a normal browser. No server, CDN, model or extra browser
is needed at runtime. The demo does not require pandas or uv.

## Use your own data

Follow the profile → analyze → author → check → deliver workflow in SKILL.md.
Source lives in `assets/`, `scripts/` and `references/`; the synthetic sample
is in `examples/sample/`.

```sh
python3 scripts/profile_data.py examples/sample/sample.csv --output dist/profile.json
python3 scripts/build.py examples/sample/page.html examples/sample/dashboard.json dist/dashboard.html
python3 scripts/check.py dist/dashboard.html
```

For independent pandas analysis, optionally run:

```sh
uv run --with pandas python examples/sample/analyze.py --output dist/analysis.json
```

CSV data supports filtering, sorting, six chart/table types, light/dark themes,
and numeric provenance back to embedded source records. Convert XLSX to CSV
locally first. Complex joins/cleaning use the Agent's local analysis tools.

## Safe sharing

The example is synthetic. Generated HTML embeds the complete source CSV,
including unused columns. Redact or aggregate sensitive data before sharing.
The provenance panel traces the embedded CSV, not every upstream cleaning step.

## License

Original implementation: [MIT](LICENSE).
