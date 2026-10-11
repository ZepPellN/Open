# Open suite — implementation spec

## Goal

Package the existing Slides, Dashboard, and Design work as one downloadable,
local-first project named **Open**, with three independently usable projects:
**Open Slides**, **Open Dashboard**, and **Open Design**.

## Decisions

- Use one Git repository with three project directories; do not publish or push
  it as part of this task.
- Preserve the existing source directories and install state outside `Open/`.
- Do not include BaoCut source, binaries, license, or the BaoCut-dependent
  launcher in Open Slides. Do not relabel or replace BaoCut's license.
- Build Open Slides from the independently licensed HTML deck authoring and
  PPTX export materials already present in baoyu-design. Retain all upstream
  and vendored notices. Describe the actual HTML/PPTX workflow; do not claim
  BaoCut editor or Claude cloud parity.
- Open Dashboard is the existing independent implementation; ship source,
  examples, tests, and its license, not local caches or generated QA data.
- Open Design includes the portable upstream skill with its MIT license and
  its original third-party materials/notices intact.
- Do not make remote repositories, public share links, or Codex Project
  registrations. Produce local source directories and downloadable archives.
- Use a local Markdown task ledger because this workspace has no configured
  remote issue tracker and this is a personal project.

## Acceptance

1. `Open/` is a standalone Git repository on an integration branch, with a
   root overview and the three named child projects.
2. Each child can be used from its own directory after following its README;
   no absolute paths into Jean's workspace are required.
3. Each child preserves the license notices applicable to its contents; no
   BaoCut Community License or BaoCut implementation is inside Open.
4. Open Dashboard's existing 20 tests pass from the copied project.
5. Open Design's existing 91 tests pass from the copied project.
6. Open Slides' copied deck guidance and exporter build/test independently,
   and a synthetic two-slide deck can be exported to PPTX with two slide parts.
7. Each child can be packaged separately; archives include its README and
   applicable license notices and exclude `.git`, caches, and generated QA data.
8. The root documents what is and is not included. No external publication.

## Known limits

Open Slides is a portable HTML/PPTX workflow, not a clone of BaoCut's rich
interactive editor. Fonts or remote image URLs can affect visual fidelity and
require network access during authoring/capture. Native PowerPoint output must
be checked in PowerPoint for exact animation compatibility.
