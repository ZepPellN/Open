# From input to a defensible conclusion

## Inspect before aggregating

Record the file name, data owner, export time (unknown if not supplied), period,
time zone, currency/unit, definition of one record, expected business key and
whether counts refer to users, events or orders. Profile candidates are NOT
confirmed business semantics. Identify missing fields, duplicate keys, late
arrivals, refunds and excluded records. Do not silently deduplicate.

Split mixed-grain long tables before joining. Validate joins using
`merge(..., validate='many_to_one')`, and compare row counts and measure totals
before/after. A sum repeated by an accidental many-to-many join is not growth.
Do not sum percentages, balances at different timestamps or identifiers.

## Useful pandas recipe

```python
import pandas as pd
df = pd.read_csv('input.csv', dtype={'channel': 'string'})
df['revenue'] = pd.to_numeric(df['revenue'], errors='raise')
assert not df.duplicated(['month', 'channel']).any()  # only after confirming key
monthly = df.groupby('month', dropna=False).revenue.sum(min_count=1)
orders = df.orders.sum(min_count=1)
aov = df.revenue.sum(min_count=1) / orders if pd.notna(orders) and orders else None
```

Preserve missingness; `sum(min_count=1)` avoids all-null sums looking like zero.
Calculate weighted ratios from totals rather than averaging segment ratios.
Verify one aggregate by a separate pivot/manual slice. Compare results with
runtime calcs before delivery. For non-additive measures, perform the actual
domain analysis externally; don't force it into the runtime's limited ops.

## Write conclusions

Use observation → definition → consequence → possible next action. Cite each
business number with `data-calc`. Say correlation, not causation, unless the
data supports causality. Explain material limitations near recommendations;
don't hide them in a tooltip. Recommend the next measurement if evidence is
weak rather than inventing certainty. No numeric business claims in static
unmarked text. A date/version or explanatory constant may use `data-static`
with a reason, but never use that escape hatch to hide a computed KPI.

Derived CSVs should retain a stable business key and document transformations.
The built-in provenance panel reaches the embedded CSV only: it does not
automatically reconstruct upstream joins or pandas execution history.
