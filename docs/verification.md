# Verification log

Verified locally on 2026-10-12. These checks use Open's own source copies,
not sibling repositories. Shareable delivery is the Git repository itself.

| Project | Check | Result |
| --- | --- | --- |
| Slides | `python3 run.py demo`, `python3 run.py test` | Build passed; 5 JavaScript and 3 Python tests passed |
| Dashboard | `python3 run.py demo`, `python3 run.py test` | Sample build/check passed; 11 JavaScript and 11 Python tests passed |
| Design | `python3 run.py demo`, `python3 run.py test` | Demo passed; 91 upstream JavaScript and 3 wrapper Python tests passed |
| Repository | `python3 -m unittest discover -s tests` | 5 tests passed, including isolated directory copies/installers |
| Source changes | `git diff --check` | Passed |

## Browser export

Opened the built Slides demo in the existing Codex in-app browser using the
loopback URL printed by `run.py serve`. Edited the first title, clicked
**Export PPTX**, and downloaded a two-slide PowerPoint file. The page reported
"Exported 2 slides." Inspecting the file found exactly two slide XML parts;
the first contains the edited title as native text with the intended color.
No extra Chromium or headless browser was installed for this path.

**Save HTML** downloaded a self-contained file retaining the edited title and
exporter. Reopening it and navigating between both slides worked. Preview was
checked at desktop and 390 × 844 mobile width. The generated/downloaded QA
artifacts are not committed.

## Installation and sharing

Root tests copy each Skill to a temporary isolated directory, install it to a
separate destination and verify license retention. Dashboard and Design demos
also run from those installed copies. The separately installed Slides copy
passed `npm ci --ignore-scripts`, demo build and all 8 tests with no parent
checkout dependencies. Installers reject existing destinations and overlapping
paths, and exclude dependencies, output, caches and secrets.
English `README.md` and Chinese `README.zh-CN.md` have reciprocal language links
at the root and in each Skill.

The obsolete delivery packagers and their tests were removed. No release
archives are generated or committed. Third-party licenses remain intact.

## Verification boundaries

PPTX structure and native text were verified; rendering/animation/font fidelity
inside PowerPoint or Keynote and the operating system print dialog were not.
Optional headless/screenshot export is not part of ordinary installation and
was not revalidated for this browser change. Tests for upstream Design tools
do not prove access to external model, image, Figma or video services.

GitHub Actions is configured to run child demos/tests and standalone source
checks. Remote publication and CI results must be read back from GitHub before
claiming them successful.
