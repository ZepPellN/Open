# Page design and review

Use a conclusion-oriented title, visible data-kind/period context, essential
filters, a few meaningful KPIs, question-led charts, recommendations, detail
table and Sources. Use open whitespace and dividers, not cards around everything.
Keep colours in `dash.css`; theme tokens are semantic, not chart-specific hacks.

Use semantic headings, visible native buttons/selects, tabular numeric figures,
keyboard focus outlines, descriptive chart names and source tooltips. Clicking
or pressing Enter/Space on a bound figure opens an accessible native dialog.
Esc/close returns to the report. Tooltips must not be the only source mechanism.

Stack sections on mobile; use readable SVG labels, contain wide tables within
their own horizontal scroll area, and keep the document free of horizontal
overflow. Do not depend on remote fonts or imagery in an offline deliverable.

Before delivery check desktop and mobile visibly, plus:

- Data labels/units/period agree with the source and calculation definitions.
- Filters update charts, KPIs, table rows and source records together.
- Numeric table sorting differs from lexicographic sorting where appropriate.
- Sources show operation, grain, data kind, limitations and original records.
- Theme retains readability; visible controls respond, with no console errors.
- Nulls are identified, not converted to zero. The real data is not replaced
  by synthetic samples except when explicitly making a labelled example.
- No hidden-source privacy surprise: the entire embedded CSV travels with HTML.

Report intentional visual differences from any supplied design separately from
functional checks. Never call a layout pixel-identical without comparing it.
