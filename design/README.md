# Open Design

English | [简体中文](README.zh-CN.md)

A portable Agent design project based on Jim Liu 宝玉's MIT **baoyu-design**
source. It uses your existing Agent/model, not a new cloud account. Complete
upstream source, tools, references, assets and tests are included here.

## Install, demo and test

From this directory (Python 3.9+; Node.js 18+ for upstream tools/tests):

```sh
python3 install.py
python3 run.py demo
python3 run.py serve --open
python3 run.py test
```

The default skill destination is `~/.agents/skills/open-design`.
For another Agent, use `--destination /path/to/open-design`; existing installs
are never overwritten. From the parent repository, first `cd design`.

## Agent workflow

Read [AGENTS.md](AGENTS.md), [SKILL.md](SKILL.md), then
`skills/baoyu-design/SKILL.md` and the relevant built-in skill/harness reference.
Example request:

> Use Open Design to create an interactive page from this product brief,
> preview it locally and verify the interaction.

Source is under `skills/baoyu-design/`; upstream tests are in its
`agents/tests/`, and wrapper tests are in `tests/`.
`examples/hello-design.html` is an original offline artifact, not an AI editor.
The demo copies it to `dist/index.html`; preview serves it on loopback.
The Agent writes real task outputs to the user's selected project directory.

Ordinary web design needs no extra Chromium. Image generation, video, Figma
import and automated PPTX have separate optional dependencies: install them
only when actually needed.

## Source and licenses

The upstream MIT [LICENSE](LICENSE) is unchanged; its original README is
[UPSTREAM_README.md](UPSTREAM_README.md). New Open entry points, wrapper and
example use `licenses/open-wrapper-MIT.txt`. Fonts, assets and vendored
libraries retain their own notices. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

This is upstream source reuse, not a claim that Open completely reverse
engineered the official Claude Design service.
