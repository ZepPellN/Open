# Open Design

Portable design workflow based on the upstream **baoyu-design** skill. The
complete upstream project and its tests are retained in this directory; its
skill entry point is [`skills/baoyu-design/SKILL.md`](skills/baoyu-design/SKILL.md).

## Install

From the repository root, install this skill into Codex:

```sh
mkdir -p ~/.agents/skills/baoyu-design
cp -R design/skills/baoyu-design/. ~/.agents/skills/baoyu-design/
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
