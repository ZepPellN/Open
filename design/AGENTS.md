# Open Design — Agent instructions

Read SKILL.md, then skills/baoyu-design/SKILL.md and its reference for your
Agent. The complete upstream source, starter components, tools and tests are
included in this directory. Upstream source retains its name and license.

- Install: `python3 install.py`; no package or browser download is automatic.
- Demo: `python3 run.py demo`; preview: `python3 run.py serve`.
- Tests: `python3 run.py test` (Node 18+ and Python 3.9+).
- New work: choose the relevant built-in skill; create the design output in a
  separate user-selected project directory, then preview its actual local URL.
- Use your Agent's ordinary file/browser tools as documented by the upstream
  reference. Do not invent Claude-only tools or claim a cloud service exists.

The tiny bundled example is an offline artifact, not an AI model UI. Generating
new designs uses the user's existing Agent/model. Optional image generation,
Figma import, video or CLI PPTX features have their own dependencies; install
only when requested. Do not download Chromium for a normal web design.

Retain the upstream MIT license, fonts/asset notices and third-party licenses
when sharing. The Open wrapper source is separately covered by
licenses/open-wrapper-MIT.txt.
