# Sample visual specification

Chosen autonomously under the user's instruction to build the local tool.
Concept: `../.dev/concept.png`, generated with the built-in image tool.
This is an implementation reference, not an image embedded in the dashboard.

- True white background; ink #202825, muted #6d766f, line #e5e9e5,
  green #33735d, recommendation background #eff5f0, ochre #b89655.
- Full primary surface: header + provenance/theme controls, report heading +
  channel filter, open three-column KPI band, two-column line/bar charts,
  recommendation strip, sortable table, Sources footer. No sidebar or bento cards.
- Desktop gutter about 52px; content maximum 1340px. Heading 40px, KPI 52px,
  body/controls 15px, chart labels 13px. System Chinese sans, tabular numerals.
- Thin dividers, understated outlined buttons, small table corners, no shadows,
  gradients, decorative imagery, eyebrow, new claims or marketing sections.
- Visible copy: 把数据，变成可解释的判断。 / 合成样例 · 不代表真实业务表现 /
  查看数字来源 / 切换主题 / 订阅经营观察 / 全部渠道 / 收入 / 付费订单 /
  平均客单价 / 收入走势 / 渠道贡献 / 先看口径，再看变化。 /
  点击任意数字，查看源表、计算方式与参与行。 / 数据明细 /
  月份 / 渠道 / 收入 / 订单 / Sources · sample.csv · 合成数据.
- Native numeric/chart/table content is computed from the sample CSV. Image
  generator's rounded channel totals (42000/25800/16800) are NOT authoritative;
  actual sample totals are 42300/25380/16920. This intentional difference avoids
  copying incorrect illustrative numbers. Dates use ISO CSV values on axes.
- The full table contains all source records rather than only the three mockup
  rows. Mobile stacks KPIs/charts, wraps header controls, contains table scrolling.
- Provenance opens a native accessible dialog. Keyboard focus, Esc and close
  work; it shows active filter, operation, data kind, source records and raw rows.
- Additional stack/mini-list/funnel examples live in a component gallery, not
  added to this primary screen. The sample remains a focused two-chart report.
