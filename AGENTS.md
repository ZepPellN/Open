# Open — Agent entry point

This repository contains three independent projects. Read the AGENTS.md and
SKILL.md in the requested directory, then use that directory as your working
directory. Do not require another child project or paths on the original
author's computer.

- Slides: `slides/AGENTS.md` — browser presentation and export.
- Dashboard: `dashboard/AGENTS.md` — local data analysis and traceable HTML.
- Design: `design/AGENTS.md` — visual artifacts using the upstream design skill.

Each directory supports `python3 install.py`, `python3 run.py demo`,
`python3 run.py serve`, and `python3 run.py test`. Installation copies only that
directory into the generic `~/.agents/skills/open-<name>` location; another
Agent can read its SKILL.md directly or install to its own skill directory via
`--destination`. Do not automatically download a browser.

Preview: keep `run.py serve` running, read its actual loopback URL, and open it
in the Agent's browser preview or the user's normal browser. `--open` uses the
user's default browser. Generated outputs are under each project's `dist/`.

Preserve upstream and third-party licenses. See `docs/provenance.md`; do not
claim these tools are official Claude services or that every source file was
reverse-engineered by this project. Do not upload user data when sharing a
dashboard or publish without checking what the generated output embeds.

Root checks: `python3 -m unittest discover -s tests`. Share source through Git;
do not create release archives. Do not commit dependencies, local data,
credential files or generated preview/output directories.
