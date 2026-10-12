# Open delivery scope

One GitHub-ready repository, three standalone directories: slides, dashboard,
design. Each includes source, README, AGENTS.md, SKILL.md, installer, example,
test entry point and applicable licenses. A copied Skill directory must not
depend on the parent repository or Jean's original checkout.

- Slides normal use runs in the user's existing browser; editable PPTX export
  is a button on the page, not a mandatory headless-browser setup.
- Retain the optional upstream CLI as an advanced path, clearly separated.
- Dashboard is our independent implementation inspired by the post's workflow.
- Design reuses the complete MIT upstream source.
- Existing source directories outside Open remain unchanged.
- Retain upstream notices; exclude BaoCut implementation rather than relicense.
- Distinguish REA analysis of a shared shell from full editor reconstruction.
- Prepare GitHub publishing and CI; do not claim remote publication until a
  repository URL and successful push have been verified.

Share and install directly from the Git repository; no archive deliverables.

Checks: all child tests, standalone directory copies and isolated demo/test runs,
install copies with license retention and no silent overwrite, real browser
editing/save/PPTX download, desktop/mobile preview. Fonts and animations in
PowerPoint itself remain a separate verification boundary.
