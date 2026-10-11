# Open Dashboard

An independent, portable dashboard builder inspired by the workflow in the
user-provided Weibo image. It is not Claude's official Dashboard or recovered
Claude source.

## Use

This project builds a self-contained HTML file; browser runtime has no server,
CDN, model, or network dependency.

```sh
python3 scripts/profile_data.py examples/sample/sample.csv --output /tmp/profile.json
uv run --with pandas python examples/sample/analyze.py --output /tmp/analysis.json
python3 scripts/build.py examples/sample/page.html examples/sample/dashboard.json /tmp/dashboard.html
python3 scripts/check.py /tmp/dashboard.html
```

Open the resulting HTML in a browser. For agent-assisted creation, install this
directory's `SKILL.md` and its sibling resources as the `open-dashboard` skill.
For Codex, copy it with:

```sh
mkdir -p ~/.agents/skills/open-dashboard
cp -R dashboard/. ~/.agents/skills/open-dashboard/
```

Reload the agent after install. The skill contains its full workflow and
safe-sharing notes.

## Verify

```sh
node --test tests/runtime.test.cjs
python3 -m unittest discover -s tests -p 'test_*.py'
```

The included sample is synthetic. Generated HTML embeds the complete source
CSV, including columns not shown in the report; redact or aggregate sensitive
data before sharing. XLSX must be converted locally to CSV first.

## License

MIT; see [LICENSE](LICENSE). This project is an independent implementation.
