# Open

English | [简体中文](README.zh-CN.md)

Three standalone Agent Skills in one repository. Clone the repository or
take just one directory: no sibling project is required.

| Project | Purpose | Start here |
| --- | --- | --- |
| Open Slides | Browser presentations: edit text, save HTML, export editable PPTX, print PDF | [slides/README.md](slides/README.md) |
| Open Dashboard | Local data analysis, interactive dashboards and numeric provenance | [dashboard/README.md](dashboard/README.md) |
| Open Design | Websites, prototypes and design systems using your existing Agent | [design/README.md](design/README.md) |

Each directory includes source, README, AGENTS.md, SKILL.md, an installer,
examples, tests and applicable licenses. No original-author filesystem paths,
cloud account or monorepo runtime is required.

## Install and use

```sh
git clone https://github.com/ZepPellN/Open.git
cd Open
```

From the directory you want to use:

```sh
python3 install.py
```

The default destination is `~/.agents/skills/open-<name>`; an existing install
is never overwritten. For another Agent, use
`--destination /path/to/skill`, or read the directory's AGENTS.md / SKILL.md
without installing.

Ask your Agent:

> Read this directory's AGENTS.md and SKILL.md, create the requested artifact,
> open the actual preview URL, and verify the result.

Slides needs a one-time `npm ci` inside `slides/`. Each project then uses the
same entry points:

```sh
python3 run.py demo
python3 run.py serve --open
python3 run.py test
```

The server binds only to loopback and prints its actual URL. `--open` launches
your default browser; an Agent can omit it and use its own preview browser.
Examples are generated at each project's `dist/index.html`. Stop with Ctrl+C.

Ordinary Slides export runs in the already-open browser. No extra Chromium,
Playwright or cloud service is required. The upstream automated CLI/screenshot
exporter remains available as an explicitly optional advanced feature.

## Share and license

Share the repository URL. Clone it and use any one Skill directory independently.
Source and license notices belong in Git; dependencies, caches, generated output
and credentials do not. There is no separate download or packaging step.

Open's original code is MIT. Included baoyu-design, PptxGenJS, JSZip, fonts and
other materials retain their own licenses. See [provenance](docs/provenance.md).
No BaoCut implementation is included or relicensed. Open is not an Anthropic
product and does not claim complete cloud-product equivalence.

## Verification and publishing

Run `python3 run.py test` inside each child, and
`python3 -m unittest discover -s tests` at the root. GitHub Actions runs these
checks without installing a browser. See [verification](docs/verification.md).

GitHub publication requires your own authenticated account; no access token is
included in the repository.
