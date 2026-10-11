# Open Design

Portable design workflow based on the upstream **baoyu-design** skill. The
complete upstream project and its tests are retained in this directory. The
Open entry point is [`SKILL.md`](SKILL.md); original upstream files remain under
[`skills/baoyu-design/`](skills/baoyu-design/).

## Install

From the repository root, install this skill into Codex:

```sh
mkdir -p ~/.agents/skills/open-design
cp -R design/. ~/.agents/skills/open-design/
```

Reload the agent after install. The skill supports visual design, prototypes,
websites, decks, diagrams, design systems, and related tasks. Follow its own
README and tool-specific references for requirements and optional integrations.

## Verify

```sh
node --test skills/baoyu-design/agents/tests/*.test.mjs
```

## License and provenance

The upstream skill is distributed under MIT; see [LICENSE](LICENSE). Files
under `skills/baoyu-design/` retain upstream content and notices. Bundled
third-party assets may have separate terms: review the notices in those
directories before redistributing them separately.
