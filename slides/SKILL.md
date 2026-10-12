---
name: open-slides
description: Create local HTML slide decks users can edit and export to PPTX in their own browser. Use for presentations, slide decks and PowerPoint creation.
---

# Open Slides

Create a presentation as a navigable, fixed-size HTML deck, then preview it and
export PPTX when requested. Treat every slide as part of a spoken story, not a
web page. Start from `skills/baoyu-design/built-in-skills/make-a-deck.md` for
the full authoring guidance and `skills/baoyu-design/starter-components/` for
the deck-stage component. The included material remains MIT-licensed upstream
content; preserve its attribution and license when copying this skill.

## Workflow

1. Clarify audience, purpose, duration, and the source material when missing.
2. Draft a title sequence and narrative outline before authoring.
3. Build one standalone HTML file with discrete slide elements and keyboard/
   touch navigation. Use generous, projection-readable type and spacing.
4. Preview and inspect all slides at presentation size; fix overflow, missing
   assets, and inconsistent typography.
5. For normal browser use, start from `examples/browser-deck.html` and the
   adapter in `src/`. Run `npm ci` once, then `python3 run.py demo` and
   `python3 run.py serve`. Open the printed URL. Users click **Export PPTX**
   there; no separate Chromium is required. Save HTML preserves their edits
   as a self-contained download. Only for explicitly requested automated or
   screenshot export, use the optional CLI in `references/export-pptx.md`.
6. Report the HTML, any PPTX, what was verified, and any export warnings.

Use editable export by default; screenshot export is static. Do not claim this
tool provides cloud collaboration, AI model access, or BaoCut editor features.
Read AGENTS.md for standalone installation, preview and test commands.
