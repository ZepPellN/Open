# Verification log

Run on 2026-10-12 from the Open checkout. These checks use the copied project
directories, not the original sibling checkouts.

| Project | Check | Result |
| --- | --- | --- |
| Open Dashboard | `node --test tests/runtime.test.cjs` | 11 passed |
| Open Dashboard | `python3 -m unittest discover -s tests -p 'test_*.py'` | 9 passed |
| Open Dashboard | Build the synthetic sample and run `scripts/check.py` | passed |
| Open Design | `node --test skills/baoyu-design/agents/tests/*.test.mjs` | 91 passed |
| Open Slides | `npm ci`, `npm run build`, `npm test` in `slides/skills/baoyu-design/agents/gen-pptx` | 67 passed |
| Open suite | `python3 -m unittest discover -s tests -p 'test_package_projects.py'` | 4 passed |

## Real PPTX export

Built the exporter, served only the synthetic example directory on
`127.0.0.1`, then ran:

```sh
node slides/skills/baoyu-design/agents/gen-pptx/dist/cli.mjs \
  --url http://127.0.0.1:8765/two-slide.html \
  --config slides/examples/two-slide-export.json \
  --out /tmp/open-slides-smoke
```

The CLI returned `ok: true`, `slides: 2`, and a 54,238-byte PPTX. Listing the
PPTX ZIP entries found exactly two `ppt/slides/slideN.xml` parts. Its only
validation notice was that the sample has no speaker notes, which is expected.
The temporary preview server was stopped after the check.

## Share archives

`python3 scripts/package_projects.py` built `open-slides.zip`,
`open-dashboard.zip`, and `open-design.zip`. All three passed `unzip -t`. The
package tests confirm each archive has its own README/license and excludes
BaoCut implementation/license material, `.git`, caches, and local QA data.
ZIPs are generated deliverables under ignored `dist/`; regenerate them after
cloning with the command above.

`npm ci` reported one moderate advisory in the Slides export dependency tree.
No automatic dependency upgrade was applied; review current npm audit details
before using the exporter in a higher-risk environment.
