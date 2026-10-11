/* Independent offline dashboard runtime. MIT; no official Claude code. */
(function (host) {
  'use strict';
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const fail = message => { throw new Error(message); };

  function parseCSV(input) {
    const text = String(input).replace(/^\uFEFF/, '');
    const records = [];
    let row = [], cell = '', quoted = false, closed = false, started = false;
    const endCell = () => { row.push(cell); cell = ''; closed = false; };
    const endRow = () => {
      endCell();
      if (started || row.length > 1 || row[0] !== '') records.push(row);
      row = []; started = false;
    };
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') { quoted = false; closed = true; }
        else cell += c;
      } else if (c === ',') { started = true; endCell(); }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        endRow();
      } else if (c === '"') {
        if (cell || closed) fail('Malformed CSV quote');
        quoted = true; started = true;
      } else {
        if (closed) fail('Unexpected character after CSV quote');
        cell += c; started = true;
      }
    }
    if (quoted) fail('Unterminated CSV quote');
    if (started || row.length || cell) endRow();
    if (!records.length) fail('CSV needs a header');
    const columns = records.shift();
    if (columns.some(x => !x.trim()) || new Set(columns).size !== columns.length) fail('Empty or duplicate CSV header');
    const result = records.map((values, i) => {
      if (values.length !== columns.length) fail(`CSV record ${i + 2} has wrong column count`);
      return Object.fromEntries(columns.map((column, j) => [column, values[j]]));
    });
    Object.defineProperty(result, 'columns', {value: columns});
    return result;
  }

  function number(value) {
    if (value === null || value === undefined || String(value).trim() === '') return null;
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(String(value).trim())) fail(`Invalid numeric value: ${value}`);
    const result = Number(value);
    if (!Number.isFinite(result)) fail(`Invalid numeric value: ${value}`);
    return result;
  }

  function mergeRecords(results) {
    const grouped = new Map();
    for (const result of results) for (const record of result.records) {
      if (!grouped.has(record.source)) grouped.set(record.source, new Set());
      record.rows.forEach(row => grouped.get(record.source).add(row));
    }
    return [...grouped].map(([source, rows]) => ({source, rows: [...rows].sort((a, b) => a - b)}));
  }

  function createEngine(config) {
    const sources = Object.fromEntries(Object.entries(config.sources || {}).map(([id, value]) => {
      const rows = parseCSV(value.csv);
      return [id, {...value, rows, columns: rows.columns}];
    }));
    const filters = new Map();
    const getSource = id => own(sources, id) ? sources[id] : fail(`Unknown source: ${id}`);
    const requireField = (id, field) => {
      if (!getSource(id).columns.includes(field)) fail(`Unknown field ${field} in ${id}`);
    };
    function select(id, where = {}) {
      const source = getSource(id);
      const pairs = [...(filters.get(id) || new Map()), ...Object.entries(where)];
      pairs.forEach(([field]) => requireField(id, field));
      return source.rows.map((values, i) => ({values, row: i + 2})).filter(record =>
        pairs.every(([field, value]) => record.values[field] === String(value)));
    }
    function aggregate(query) {
      const {source, field, op = 'sum', where = {}} = query;
      if (!['sum', 'mean', 'min', 'max', 'count'].includes(op)) fail(`Unsupported operation: ${op}`);
      let selected = select(source, where);
      let value;
      if (op === 'count') value = selected.length;
      else {
        requireField(source, field);
        selected = selected.map(record => ({...record, value: number(record.values[field])})).filter(record => record.value !== null);
        const values = selected.map(record => record.value);
        if (!values.length) value = null;
        else if (op === 'sum' || op === 'mean') {
          value = values.reduce((a, b) => a + b, 0) / (op === 'mean' ? values.length : 1);
        } else value = values.reduce((a, b) => op === 'min' ? Math.min(a, b) : Math.max(a, b));
        if (value !== null && !Number.isFinite(value)) fail('Numeric aggregation overflow');
      }
      return {...query, value, records: [{source, rows: selected.map(record => record.row)}],
        formula: `${op}(${source}.${field || '*'})`, filters: Object.fromEntries(filters.get(source) || [])};
    }
    function calc(id, visited = []) {
      if (!own(config.calcs || {}, id)) fail(`Unknown calc: ${id}`);
      if (visited.includes(id)) fail(`Calculation cycle: ${[...visited, id].join(' → ')}`);
      const definition = config.calcs[id];
      if (definition.op !== 'ratio') return {...aggregate(definition), id};
      const a = calc(definition.numerator, [...visited, id]);
      const b = calc(definition.denominator, [...visited, id]);
      const value = a.value === null || b.value === null || b.value === 0 ? null : a.value / b.value;
      if (value !== null && !Number.isFinite(value)) fail('Numeric ratio overflow');
      return {...definition, id, value, records: mergeRecords([a, b]),
        formula: `${definition.numerator} / ${definition.denominator}`, dependencies: [a, b]};
    }
    function group(query) {
      requireField(query.source, query.group);
      return [...new Set(select(query.source, query.where).map(record => record.values[query.group]))].map(label =>
        ({...aggregate({...query, where: {...query.where, [query.group]: label}}), label}));
    }
    function table(id, field, descending = false) {
      const selected = select(id);
      if (!field) return selected;
      requireField(id, field);
      const numeric = selected.every(record => record.values[field].trim() === '' || Number.isFinite(Number(record.values[field])));
      return selected.sort((a, b) => {
        const x = a.values[field], y = b.values[field];
        const order = numeric ? (number(x) ?? -Infinity) - (number(y) ?? -Infinity) : x.localeCompare(y, 'zh-CN');
        return (descending ? -1 : 1) * order;
      });
    }
    function cell(id, field, rowNumber) {
      requireField(id, field);
      if (!Number.isInteger(rowNumber) || rowNumber < 2 || rowNumber > getSource(id).rows.length + 1) fail(`Invalid CSV record: ${rowNumber}`);
      const record = select(id).find(item => item.row === rowNumber);
      return {value: record ? record.values[field] : null, field,
        formula: `${id}.${field} [CSV record ${rowNumber}]`,
        records: [{source: id, rows: record ? [rowNumber] : []}], filters: Object.fromEntries(filters.get(id) || [])};
    }
    return {sources, calc, aggregate, group, table, select, cell, requireField,
      setFilter(id, field, value) {
        requireField(id, field);
        if (!filters.has(id)) filters.set(id, new Map());
        if (value === '') filters.get(id).delete(field);
        else filters.get(id).set(field, String(value));
      },
    };
  }

  function format(value, definition = {}) {
    if (value === null || value === undefined) return '暂无数据';
    if (typeof value !== 'number') return String(value);
    const options = {maximumFractionDigits: definition.digits ?? 0};
    if (definition.format === 'currency') Object.assign(options, {style: 'currency', currency: definition.currency || 'CNY'});
    if (definition.format === 'percent') Object.assign(options, {style: 'percent', maximumFractionDigits: definition.digits ?? 1});
    return new Intl.NumberFormat('zh-CN', options).format(value);
  }

  function extent(values) {
    const numeric = values.map(value => value ?? 0);
    let minimum = 0, maximum = 0;
    numeric.forEach(value => { minimum = Math.min(minimum, value); maximum = Math.max(maximum, value); });
    if (minimum === maximum) maximum = minimum + 1;
    return {minimum, maximum};
  }

  function mount(config, doc = host.document) {
    const engine = createEngine(config);
    const NS = 'http://www.w3.org/2000/svg';
    const el = (tag, text, className) => {
      const element = doc.createElement(tag);
      if (text !== undefined) element.textContent = text;
      if (className) element.className = className;
      return element;
    };
    const svgEl = (tag, attributes = {}) => {
      const element = doc.createElementNS(NS, tag);
      for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
      return element;
    };
    const dialog = el('dialog', undefined, 'source-dialog');
    dialog.setAttribute('aria-label', '数字来源');
    doc.body.append(dialog);
    const tooltip = el('div', undefined, 'dash-tooltip');
    tooltip.setAttribute('role', 'tooltip'); tooltip.hidden = true;
    doc.body.append(tooltip);
    function showSource(result) {
      tooltip.hidden = true;
      dialog.replaceChildren();
      const close = el('button', '关闭', 'close'); close.type = 'button';
      close.addEventListener('click', () => dialog.close());
      dialog.append(close, el('h2', result.label || '数字来源'), el('p', format(result.value, result), 'source-value'),
        el('p', result.formula || '原始记录', 'formula'));
      for (const record of result.records) {
        const source = engine.sources[record.source];
        dialog.append(el('h3', source.label || record.source));
        const kind = source.kind === 'synthetic' ? '合成数据' : source.kind === 'derived' ? '派生数据' : source.kind === 'provided' ? '用户提供数据' : '数据种类未声明';
        const details = el('p', `${kind} · ${source.file || record.source} · CSV 记录 ${record.rows.join(', ') || '无'}（表头为第 1 条，空白行不计；不是物理行号）`, 'muted');
        dialog.append(details);
        if (source.grain) dialog.append(el('p', `数据粒度：${source.grain}`));
        if (source.limitations) dialog.append(el('p', `限制：${source.limitations}`, 'muted'));
        const active = result.filters || (result.dependencies || []).find(x => x.records.some(r => r.source === record.source))?.filters;
        if (active && Object.keys(active).length) dialog.append(el('p', `当前筛选：${JSON.stringify(active)}`));
        if (result.where && Object.keys(result.where).length) dialog.append(el('p', `分组条件：${JSON.stringify(result.where)}`));
        const wrapper = el('div', undefined, 'table-wrap');
        const table = el('table'); const head = el('tr'); head.append(el('th', '记录'));
        source.columns.forEach(column => head.append(el('th', column)));
        table.append(head);
        record.rows.slice(0, 50).forEach(rowNumber => {
          const tr = el('tr'); tr.append(el('td', rowNumber));
          source.columns.forEach(column => tr.append(el('td', source.rows[rowNumber - 2][column])));
          table.append(tr);
        });
        wrapper.append(table); dialog.append(wrapper);
        if (record.rows.length > 50) dialog.append(el('p', '预览前 50 条，完整数据已嵌入此 HTML。'));
      }
      if (result.dependencies) result.dependencies.forEach(part => dialog.append(el('p', `${part.id} = ${format(part.value, part)} · ${part.formula}`)));
      if (!dialog.open) dialog.showModal();
    }
    function bind(element, result, description) {
      element.dataset.source = result.records.map(record => record.source).join(',');
      if (result.field) element.dataset.field = result.field;
      element.dataset.provenance = 'true'; element.tabIndex = 0;
      element.setAttribute('role', 'button');
      element.setAttribute('aria-label', `${description || result.label || '数值'}：${format(result.value, result)}，查看来源`);
      element.addEventListener('click', () => showSource(result));
      element.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showSource(result); }
      });
      const showTip = event => {
        tooltip.textContent = `${description || result.label || ''} ${format(result.value, result)} · 点击查看来源`;
        tooltip.hidden = false;
        const rect = element.getBoundingClientRect();
        const x = event.clientX || rect.left; const y = event.clientY || rect.bottom;
        tooltip.style.left = `${Math.max(8, Math.min(x + 12, doc.documentElement.clientWidth - 270))}px`;
        tooltip.style.top = `${Math.max(8, Math.min(y + 14, doc.documentElement.clientHeight - 60))}px`;
      };
      element.addEventListener('pointerenter', showTip);
      element.addEventListener('pointermove', showTip);
      element.addEventListener('focus', showTip);
      element.addEventListener('pointerleave', () => { tooltip.hidden = true; });
      element.addEventListener('blur', () => { tooltip.hidden = true; });
    }
    function label(svg, x, y, text, anchor = 'start') {
      const node = svgEl('text', {x, y, 'text-anchor': anchor, class: 'chart-label'});
      node.textContent = text; svg.append(node); return node;
    }
    function renderTable(container, definition) {
      const columns = definition.columns || engine.sources[definition.source].columns.map(field => ({field, label: field}));
      const wrapper = el('div', undefined, 'table-wrap'); const table = el('table');
      const thead = el('thead'), header = el('tr'), tbody = el('tbody');
      const sort = container._sort || {};
      columns.forEach(column => {
        engine.requireField(definition.source, column.field);
        const th = el('th');
        th.setAttribute('scope', 'col');
        th.setAttribute('aria-sort', sort.field === column.field ? (sort.descending ? 'descending' : 'ascending') : 'none');
        const button = el('button', `${column.label || column.field} ${sort.field === column.field ? (sort.descending ? '↓' : '↑') : '↕'}`);
        button.type = 'button';
        button.addEventListener('click', () => {
          container._sort = {field: column.field, descending: sort.field === column.field ? !sort.descending : false};
          container.replaceChildren(); renderTable(container, definition);
        });
        th.append(button); header.append(th);
      });
      const records = engine.table(definition.source, sort.field, sort.descending);
      records.forEach(record => {
        const tr = el('tr');
        columns.forEach(column => {
          const raw = record.values[column.field];
          const value = column.format || column.numeric ? number(raw) : raw;
          const td = el('td', format(value, column));
          bind(td, {...column, value, label: column.label, formula: `${definition.source}.${column.field}`, records: [{source: definition.source, rows: [record.row]}]}, column.label);
          tr.append(td);
        });
        tbody.append(tr);
      });
      thead.append(header); table.append(thead, tbody); wrapper.append(table); container.append(wrapper);
      if (!records.length) container.append(el('p', '暂无数据', 'empty'));
    }
    function renderChart(container, definition) {
      if (definition.type === 'table') return renderTable(container, definition);
      let values;
      if (definition.type === 'funnel') values = definition.items.map(item => ({...engine.calc(item.calc), label: item.label}));
      else values = engine.group(definition);
      if (!values.length || values.every(item => item.value === null)) { container.append(el('p', '暂无数据', 'empty')); return; }
      if (definition.type === 'mini-list') {
        const list = el('ul', undefined, 'mini-list');
        values.forEach(item => { const row = el('li'); row.append(el('span', item.label)); const metric = el('span', format(item.value, definition)); bind(metric, {...item, ...definition, value: item.value}, item.label); row.append(metric); list.append(row); });
        container.append(list); return;
      }
      if (!['line', 'bar', 'stack', 'funnel'].includes(definition.type)) fail(`Unknown chart type: ${definition.type}`);
      const narrow = container.clientWidth < 480;
      const W = narrow ? 420 : 600, H = 270, left = 65, right = 65, top = 24, bottom = 42;
      const svg = svgEl('svg', {viewBox: `0 0 ${W} ${H}`, role: 'group', 'aria-label': definition.label || container.getAttribute('aria-label') || '数据图表'});
      const plotW = W - left - right, plotH = H - top - bottom;
      const numeric = values.map(item => item.value ?? 0);
      if (definition.type === 'stack' || definition.type === 'funnel') {
        if (numeric.some(value => value < 0)) fail(`${definition.type} requires nonnegative values`);
      }
      const {minimum, maximum} = extent(numeric);
      const range = maximum - minimum || 1;
      const y = value => top + (maximum - value) / range * plotH;
      const x = value => left + (value - minimum) / range * plotW;
      if (definition.type === 'line') {
        for (let i = 0; i <= 4; i++) {
          const tick = minimum + range * i / 4, position = y(tick);
          svg.append(svgEl('line', {x1: left, x2: W - right, y1: position, y2: position, class: 'grid-line'}));
          label(svg, left - 10, position + 4, format(tick, {digits: range <= 4 ? 2 : 0}), 'end');
        }
        const step = plotW / Math.max(1, values.length - 1);
        let previous = false, path = '';
        values.forEach((item, i) => {
          if (item.value === null) { previous = false; return; }
          path += `${previous ? 'L' : 'M'}${left + i * step},${y(item.value)} `; previous = true;
        });
        if (values.every(item => item.value !== null) && minimum === 0) {
          svg.append(svgEl('path', {d: `${path}L${left + (values.length - 1) * step},${y(0)} L${left},${y(0)} Z`, class: 'line-area'}));
        }
        svg.append(svgEl('path', {d: path, class: 'line-path'}));
        values.forEach((item, i) => {
          const px = left + i * step;
          const axisLabel = narrow && /^\d{4}-\d{2}$/.test(item.label) ? `${item.label.slice(5)}月` : item.label;
          if (i % Math.max(1, Math.ceil(values.length / 8)) === 0 || i === values.length - 1) label(svg, px, H - 12, axisLabel, 'middle');
          if (item.value === null) return;
          const circle = svgEl('circle', {cx: px, cy: y(item.value), r: 5, class: 'line-point'});
          bind(circle, {...definition, ...item}, item.label); svg.append(circle);
          if (values.length <= 8) { const text = label(svg, px, y(item.value) - 13, format(item.value, definition), 'middle'); bind(text, {...definition, ...item}, item.label); }
        });
      } else {
        const step = plotH / values.length;
        for (let i = 0; i <= 4; i++) {
          const tick = minimum + range * i / 4, position = x(tick);
          svg.append(svgEl('line', {x1: position, x2: position, y1: top, y2: H - bottom, class: 'grid-line'}));
          label(svg, position, H - 12, format(tick, {digits: range <= 4 ? 2 : 0}), 'middle');
        }
        svg.append(svgEl('line', {x1: x(0), x2: x(0), y1: top, y2: H - bottom, class: 'grid-line'}));
        const categories = definition.type === 'stack' ? [...new Set(engine.select(definition.source, definition.where).map(record => record.values[definition.series]))] : [];
        if (definition.type === 'stack') engine.requireField(definition.source, definition.series);
        values.forEach((item, i) => {
          const height = Math.min(45, step * .65);
          const py = top + i * step + (step - height) / 2;
          label(svg, left - 10, py + height / 2 + 4, item.label, 'end');
          const pieces = definition.type === 'stack' ? categories.map(category => ({...engine.aggregate({...definition, where: {...item.where, [definition.series]: category}}), category})) : [item];
          let start = 0;
          pieces.forEach((part, j) => {
            if (part.value === null) return;
            const value = part.value ?? 0;
            if (definition.type === 'stack' && value < 0) fail('stack requires nonnegative series');
            const a = definition.type === 'stack' ? start : Math.min(0, value);
            const b = definition.type === 'stack' ? start + value : Math.max(0, value);
            const rect = svgEl('rect', {x: x(a), y: py, width: x(b) - x(a), height, class: `bar-mark series-${j % 5}`});
            bind(rect, {...definition, ...part}, `${item.label}${part.category ? ` · ${part.category}` : ''}`);
            svg.append(rect); start += value;
          });
          const negative = item.value < 0;
          const text = label(svg, x(item.value ?? 0) + (negative ? -10 : 10), py + height / 2 + 4, format(item.value, definition), negative ? 'end' : 'start');
          bind(text, {...definition, ...item}, item.label);
        });
        if (categories.length) {
          const legend = el('div', undefined, 'legend');
          categories.forEach((category, i) => { const entry = el('span', category); entry.style.setProperty('--legend-color', `var(--series-${i % 5})`); legend.append(entry); });
          container.append(legend);
        }
      }
      container.prepend(svg);
    }
    function render() {
      tooltip.hidden = true; if (dialog.open) dialog.close();
      doc.querySelectorAll('[data-calc]').forEach(element => {
        const result = engine.calc(element.dataset.calc);
        const replacement = element.cloneNode(false); replacement.textContent = format(result.value, result);
        bind(replacement, result, result.label); element.replaceWith(replacement);
      });
      doc.querySelectorAll('[data-source][data-field][data-record]:not([data-calc])').forEach(element => {
        const result = engine.cell(element.dataset.source, element.dataset.field, Number(element.dataset.record));
        const definition = {format: element.dataset.format, label: element.dataset.label || element.dataset.field};
        if (element.dataset.digits !== undefined) definition.digits = Number(element.dataset.digits);
        if (definition.format || element.hasAttribute('data-numeric')) result.value = number(result.value);
        Object.assign(result, definition);
        const replacement = element.cloneNode(false); replacement.textContent = format(result.value, result);
        bind(replacement, result, result.label); element.replaceWith(replacement);
      });
      doc.querySelectorAll('[data-chart]').forEach(element => {
        const id = element.dataset.chart;
        if (!own(config.charts || {}, id)) fail(`Unknown chart: ${id}`);
        element.replaceChildren(); renderChart(element, config.charts[id]);
      });
      doc.documentElement.dataset.dashboardReady = 'true';
    }
    doc.querySelectorAll('[data-filter-source]').forEach(select => {
      const source = select.dataset.filterSource, field = select.dataset.filterField;
      engine.requireField(source, field);
      const initial = select.options[0]?.textContent || '全部'; select.replaceChildren(el('option', initial));
      select.options[0].value = '';
      [...new Set(engine.sources[source].rows.map(row => row[field]))].filter(value => value !== '').forEach(value => {
        const option = el('option', value); option.value = value; select.append(option);
      });
      select.addEventListener('change', () => { engine.setFilter(source, field, select.value); render(); });
    });
    doc.querySelectorAll('[data-theme-toggle]').forEach(button => button.addEventListener('click', () => {
      doc.documentElement.dataset.theme = doc.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      button.setAttribute('aria-pressed', String(doc.documentElement.dataset.theme === 'dark'));
    }));
    doc.querySelectorAll('[data-source-mode]').forEach(button => button.addEventListener('click', () => {
      const active = doc.documentElement.dataset.sourceMode !== 'true';
      doc.documentElement.dataset.sourceMode = String(active); button.setAttribute('aria-pressed', String(active));
      button.textContent = active ? '返回使用页面' : '查看数字来源';
    }));
    render();
    return {engine, render, showSource};
  }
  const api = {parseCSV, createEngine, format, extent, mount};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else {
    host.Dash = api;
    const boot = () => {
      const data = host.document.getElementById('dashboard-data');
      if (!data) return;
      try { host.dashboard = mount(JSON.parse(data.textContent)); }
      catch (error) {
        host.document.documentElement.dataset.dashboardError = error.message;
        const notice = host.document.createElement('p'); notice.className = 'dash-error';
        notice.setAttribute('role', 'alert'); notice.textContent = `看板加载失败：${error.message}`;
        host.document.body.prepend(notice); host.console.error(error);
      }
    };
    if (host.document.readyState === 'loading') host.document.addEventListener('DOMContentLoaded', boot);
    else boot();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
