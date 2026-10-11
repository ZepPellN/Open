const {test} = require('node:test');
const assert = require('node:assert/strict');
const Dash = require('../assets/dash.js');
const config = {
  sources: {s: {label: '合成数据', kind: 'synthetic', csv: 'channel,revenue,orders\n自然,10,2\n社群,20,4\n自然,30,3\n'}},
  calcs: {
    total: {source: 's', op: 'sum', field: 'revenue'},
    orders: {source: 's', op: 'sum', field: 'orders'},
    average: {op: 'ratio', numerator: 'total', denominator: 'orders'},
  },
};
test('CSV: escaped quotes, quoted newline, BOM, CRLF and trailing empty cells', () => {
  assert.deepEqual(Dash.parseCSV('\ufeffname,note,value\r\n"a,b","say ""hi""\nnow",\r\n'),
    [{name: 'a,b', note: 'say "hi"\nnow', value: ''}]);
});
test('CSV rejects ambiguous headers and malformed rows', () => {
  for (const csv of ['a,a\n1,2', 'a,b\n1', 'a\n"unterminated', 'a\n1,2', 'a\n"x"oops']) {
    assert.throws(() => Dash.parseCSV(csv));
  }
});
test('real aggregation and ratio carry source records, not hardcoded metadata', () => {
  const engine = Dash.createEngine(config);
  assert.equal(engine.calc('total').value, 60);
  assert.equal(engine.calc('average').value, 60 / 9);
  assert.deepEqual(engine.calc('total').records, [{source: 's', rows: [2, 3, 4]}]);
  assert.deepEqual(engine.calc('average').records, [{source: 's', rows: [2, 3, 4]}]);
});
test('a filter updates KPIs, groups and provenance together', () => {
  const engine = Dash.createEngine(config);
  engine.setFilter('s', 'channel', '自然');
  assert.equal(engine.calc('total').value, 40);
  assert.deepEqual(engine.calc('orders').records[0].rows, [2, 4]);
  assert.deepEqual(engine.group({source: 's', group: 'channel', field: 'revenue', op: 'sum'}).map(x => [x.label, x.value]), [['自然', 40]]);
  engine.setFilter('s', 'channel', '');
  assert.equal(engine.calc('total').value, 60);
});
test('missing numbers are excluded, invalid numbers rejected, empty aggregate is not zero', () => {
  const engine = Dash.createEngine({sources: {s: {csv: 'x\n\n""\n'}}, calcs: {x: {source: 's', field: 'x', op: 'sum'}}});
  assert.equal(engine.calc('x').value, null);
  const bad = Dash.createEngine({sources: {s: {csv: 'x\nnot-a-number'}}, calcs: {x: {source: 's', field: 'x', op: 'sum'}}});
  assert.throws(() => bad.calc('x'), /numeric|数值/i);
});
test('unknown references, fields, cycles and unsupported operations fail explicitly', () => {
  const engine = Dash.createEngine(config);
  assert.throws(() => engine.calc('missing'), /calc/);
  assert.throws(() => engine.aggregate({source: 's', field: 'missing', op: 'sum'}), /field/);
  assert.throws(() => engine.aggregate({source: 's', field: 'revenue', op: 'magic'}), /operation/);
  const cyclic = Dash.createEngine({...config, calcs: {a: {op: 'ratio', numerator: 'b', denominator: 'b'}, b: {op: 'ratio', numerator: 'a', denominator: 'a'}}});
  assert.throws(() => cyclic.calc('a'), /cycle/);
});
test('zero denominator is undefined rather than an invented zero', () => {
  const engine = Dash.createEngine({sources: {s: {csv: 'x,y\n5,0'}}, calcs: {x: {source: 's', field: 'x', op: 'sum'}, y: {source: 's', field: 'y', op: 'sum'}, r: {op: 'ratio', numerator: 'x', denominator: 'y'}}});
  assert.equal(engine.calc('r').value, null);
});
test('non-decimal coercions are not quietly treated as business numbers', () => {
  for (const value of ['0x20', 'Infinity', 'NaN', 'true', '1,000']) {
    const csv = value.includes(',') ? `x\n"${value}"` : `x\n${value}`;
    const engine = Dash.createEngine({sources: {s: {csv}}, calcs: {x: {source: 's', field: 'x', op: 'sum'}}});
    assert.throws(() => engine.calc('x'), /numeric/);
  }
});
test('table sort compares numeric values and leaves original records unchanged', () => {
  const engine = Dash.createEngine(config);
  assert.deepEqual(engine.table('s', 'revenue', true).map(r => r.row), [4, 3, 2]);
  assert.deepEqual(engine.table('s', 'revenue', false).map(r => r.row), [2, 3, 4]);
  assert.equal(engine.sources.s.rows[0].revenue, '10');
});
test('direct source cells retain exact record identity and obey active filters', () => {
  const engine = Dash.createEngine(config);
  assert.equal(engine.cell('s', 'revenue', 3).value, '20');
  assert.deepEqual(engine.cell('s', 'revenue', 3).records, [{source:'s', rows:[3]}]);
  engine.setFilter('s', 'channel', '自然');
  assert.equal(engine.cell('s', 'revenue', 3).value, null);
  assert.deepEqual(engine.cell('s', 'revenue', 3).records[0].rows, []);
  assert.throws(() => engine.cell('s', 'revenue', 1), /record/);
});
test('zero-only chart scale has a real range rather than putting zero above the plot', () => {
  assert.deepEqual(Dash.extent([0,0]), {minimum:0, maximum:1});
  assert.deepEqual(Dash.extent([-5,0,10]), {minimum:-5, maximum:10});
});
