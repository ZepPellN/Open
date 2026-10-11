# Runtime API

The browser exposes `Dash` and `dashboard`; CommonJS exposes the same pure data
functions. Mount automatically reads JSON in `script#dashboard-data`.

## Bundle contract

```json
{
  "sources": {
    "sales": {"file": "sales.csv", "label": "用户提供的销售表", "kind": "provided", "grain": "日期 × 渠道", "limitations": "不含退款"}
  },
  "calcs": {
    "revenue": {"source": "sales", "field": "revenue", "op": "sum", "label": "收入", "format": "currency", "currency": "CNY"},
    "orders": {"source": "sales", "field": "orders", "op": "sum"},
    "aov": {"op": "ratio", "numerator": "revenue", "denominator": "orders", "format": "currency", "digits": 2}
  },
  "charts": {
    "trend": {"type": "line", "source": "sales", "group": "month", "field": "revenue", "op": "sum"},
    "channels": {"type": "bar", "source": "sales", "group": "channel", "field": "revenue", "op": "sum"},
    "stack": {"type": "stack", "source": "sales", "group": "month", "series": "channel", "field": "revenue", "op": "sum"},
    "list": {"type": "mini-list", "source": "sales", "group": "channel", "field": "revenue", "op": "sum"},
    "funnel": {"type": "funnel", "items": [{"label": "订单", "calc": "orders"}]},
    "table": {"type": "table", "source": "sales", "columns": [{"field": "month", "label": "月份"}, {"field": "revenue", "label": "收入", "numeric": true}]}
  }
}
```

`file` resolves relative to the JSON input; build embeds its UTF-8 CSV as `csv`.
Declare data kind as `provided`, `derived` or `synthetic`. Source metadata is
displayed in the source panel. Declare formulas' units externally; no implicit
currency conversion, date parsing or business deduplication occurs.

Aggregate `op`: `sum`, `mean`, `min`, `max`, `count`. `count` counts selected
records, including missing fields. Other ops require a numeric `field`, exclude
blank values and record exactly the participating rows. Empty aggregate → null.
`where` optionally maps fields to exact CSV-string values; multiple conditions
AND together with active filters. Ratio references two calc IDs, not JS code;
division by zero or undefined operand → null, cycles/errors fail explicitly.
Groups preserve source-record order. Sort/normalize dates before writing CSV.

Formatting: `currency` (default CNY), `percent` (input is a fraction, 0.2 → 20%),
or ordinary number; `digits` gives maximum decimals (default 0, percent 1).
Quoted thousands/currency text must be normalized upstream; runtime accepts
finite decimal/scientific-notation measures, not loose JavaScript coercions.

## HTML bindings

```html
<output data-calc="revenue"></output>
<span data-source="sales" data-field="revenue" data-record="2" data-format="currency"></span>
<div class="chart" data-chart="trend" aria-label="月度收入"></div>
<select data-filter-source="sales" data-filter-field="channel" aria-label="渠道筛选"><option value="">全部渠道</option></select>
<button type="button" data-theme-toggle aria-pressed="false">切换主题</button>
<button type="button" data-source-mode aria-pressed="false">查看数字来源</button>
```

Runtime adds `data-source`, `data-field` where applicable, `data-provenance`,
role/button/tabIndex and accessible labels to measures, chart marks and table
cells. Source mode highlights them. Empty-valued category cannot be selected
with the reserved all-values filter `''`; clean missing-category semantics
upstream. Theme is per page session, no localStorage or cookies.

Direct raw-cell bindings require an explicit CSV `data-record` and `data-field`;
runtime replaces their text with the actual value, never trusting a manually
typed number. Use `data-format`, optional `data-digits` or `data-numeric` for
numeric cells. A record excluded by the current filter shows 暂无数据 with empty
provenance; don't use a fixed raw record as an aggregate KPI.

## JavaScript methods

- `Dash.parseCSV(text)` → array of string-valued records with non-enumerable
  `.columns`. Supports BOM, CRLF, commas, escaped quotes and multiline fields;
  rejects duplicate headers, mismatched columns and malformed quoting.
- `Dash.createEngine(config)` → `{sources, calc, aggregate, group, table,
  select, setFilter, requireField}`.
- `engine.calc(id)` → `{value, records, formula, ...definition}`. Records list
  `{source, rows}` using parsed CSV record indices starting at 2 (header = 1,
  blank lines skipped; not physical lines).
- `engine.aggregate({source, field, op, where})` → same provenance result.
- `engine.group({source, group, field, op, where})` → ordered results with label.
- `engine.select(source, where)` → `{values, row}` records under active filters.
- `engine.cell(source, field, CSV_record)` → exact raw-cell value and provenance
  under active filters; invalid fields/record indices fail explicitly.
- `engine.table(source, field?, descending?)` → selected/sorted records; never
  mutates sources. Numeric columns sort numerically, others by zh-CN locale.
- `engine.setFilter(source, field, value)` → change equality filter (`''` clears).
- `Dash.format(value, definition?)` → localized string; null → 暂无数据.
- `Dash.extent(values)` → zero-inclusive `{minimum, maximum}` plot scale;
  a zero-only series gets a nondegenerate range instead of a misleading axis.
- `Dash.mount(config, document?)` → `{engine, render, showSource}`.
  Changing filters via DOM auto-renders; programmatic changes need `render()`.

`documentElement.dataset.dashboardReady` is `true` after initial render;
`dashboardError` contains a boot failure. The runtime performs no network calls
and never uses innerHTML/eval for CSV values. Templates and runtime JS are
trusted code, not a sandbox for arbitrary downloaded HTML.
