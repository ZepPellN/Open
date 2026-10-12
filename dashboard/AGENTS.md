# Open Dashboard — Agent instructions

Read SKILL.md for the profile → analyze → author → check → deliver workflow.
Use this directory as cwd; all runtime, scripts, references and tests are here.

- Install: `python3 install.py` (optional; otherwise read SKILL.md directly).
- Demo: `python3 run.py demo`; preview: `python3 run.py serve`.
- Tests: `python3 run.py test` (Python 3.9+ and Node 18+).
- New data: profile with scripts/profile_data.py, analyze locally (pandas is
  optional for the demo), then author a template/config using examples/sample.
- Build: `python3 scripts/build.py <template.html> <config.json> <output.html>`.
- Check: `python3 scripts/check.py <output.html>`.

Open the generated standalone HTML in a normal browser. Verify filtering,
sorting and numeric provenance. Use the in-app browser for local preview when
available. No cloud service, extra browser install or sibling project is needed.

Never invent input facts. Label sample data synthetic; explain missing values,
grain and metric definitions. The HTML contains embedded source data, including
unused columns: redact or aggregate sensitive records before sharing.

This is our independent implementation inspired by the source post's workflow,
not official Claude source or the author's unpublished attachment.
