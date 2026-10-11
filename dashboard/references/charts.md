# Choose charts by the question

| Question | Type | Important rule |
| --- | --- | --- |
| How does a measure change over time? | line | Sort the time field before export; missing values break the line. |
| Which category contributes more? | bar | Zero baseline; negative measures extend left. |
| How does composition change by group? | stack | Nonnegative additive series only; stable series colours. |
| Which few values should I compare? | mini-list | Keep labels and source-linked numbers; no ornamental chart. |
| Where does a single cohort drop out? | funnel | Same cohort/period and compatible counting units; stage ordering explicit. |
| What happened at record level? | table | Numeric sorting, source-linked cells, contained mobile scrolling. |

Use the five palette tokens in `dash.css`, distinguish colour with labels and
position, and retain contrast in both themes. Don't use a pie for many segments,
two y axes to suggest causality, truncated bar baselines, invented smoothing or
silently dropped outliers. Axis ticks are scale guides, not sourced observations.

The simple line/bar runtime supports one measure per chart. Stack uses one
categorical series field. Funnel is a horizontal staged-count chart, not a
geometrically distorted trapezoid. Label this honestly. Keep about eight time
points or a few categories for small screens; aggregate explicitly rather than
silently hiding data. For dense custom visualisations, extend the trusted runtime
with tests or use a separate visualisation implementation; document the change.
