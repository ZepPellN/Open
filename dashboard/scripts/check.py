#!/usr/bin/env python3
"""Static checks, JavaScript syntax and declarative calculation validation."""
import argparse
from collections import Counter
import csv
from html.parser import HTMLParser
import io
import json
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.ids = []
        self.calcs = []
        self.charts = []
        self.sources = []
        self.scripts = []
        self.data = ''
        self.issues = []
        self.active_script = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if 'data-calc' in attrs:
            self.calcs.append(attrs['data-calc'])
        if 'data-chart' in attrs:
            self.charts.append(attrs['data-chart'])
        if 'data-source' in attrs:
            self.sources.append(attrs)
        for key in ('src', 'href'):
            if key in attrs and not attrs[key].startswith(('#', 'data:')):
                self.issues.append(f'External resource/link: {tag} {key}={attrs[key]} (offline page only)')
        if tag == 'script':
            self.active_script = {'attrs': attrs, 'text': ''}
        if tag not in VOID:
            self.stack.append((tag, attrs))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag == 'script' and self.active_script is not None:
            script = self.active_script
            if script['attrs'].get('id') == 'dashboard-data':
                self.data = script['text']
            elif script['attrs'].get('type', '') in ('', 'text/javascript', 'module'):
                self.scripts.append(script['text'])
            self.active_script = None
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                self.stack = self.stack[:i]
                break

    def handle_data(self, text):
        if self.active_script is not None:
            self.active_script['text'] += text
            return
        if any(tag in ('style', 'title') for tag, _ in self.stack):
            return
        if re.search(r'\d', text) and not any('data-calc' in attrs or 'data-source' in attrs or 'data-static' in attrs for _, attrs in self.stack):
            self.issues.append(f'unmarked number in text: {text.strip()[:100]}')


def check(path):
    page = Page()
    page.feed(Path(path).read_text(encoding='utf-8'))
    issues = page.issues
    for name, count in Counter(page.ids).items():
        if count > 1:
            issues.append(f'duplicate id: {name}')
    try:
        config = json.loads(page.data)
    except (ValueError, TypeError) as error:
        issues.append(f'Invalid dashboard-data JSON: {error}')
        config = {}
    for name in page.calcs:
        if name not in config.get('calcs', {}):
            issues.append(f'unknown calc: {name}')
    for name in page.charts:
        if name not in config.get('charts', {}):
            issues.append(f'unknown chart: {name}')
    for attrs in page.sources:
        names, field = attrs['data-source'], attrs.get('data-field')
        if 'data-calc' not in attrs and (not field or not attrs.get('data-record')):
            issues.append('Direct source binding needs data-field and data-record; use data-calc for aggregates')
        for name in names.split(','):
            if name not in config.get('sources', {}):
                issues.append(f'unknown source: {name}')
            elif field:
                records = [row for row in csv.reader(io.StringIO(config['sources'][name].get('csv', '').removeprefix('\ufeff'))) if row]
                columns = records[0] if records else []
                if field not in columns:
                    issues.append(f'unknown source field: {name}.{field}')
                if attrs.get('data-record'):
                    count = len(records)
                    try:
                        record = int(attrs['data-record'])
                        if not 2 <= record <= count:
                            raise ValueError()
                    except ValueError:
                        issues.append('Invalid data-record: ' + attrs['data-record'])
    node = shutil.which('node')
    if not node:
        issues.append('JavaScript checks unavailable: install Node.js')
        return issues
    with tempfile.TemporaryDirectory(prefix='data-dashboard-check-') as directory:
        directory = Path(directory)
        for i, script in enumerate(page.scripts):
            script_path = directory / f'script-{i}.js'
            script_path.write_text(script)
            result = subprocess.run([node, '--check', str(script_path)], capture_output=True, text=True, timeout=30)
            if result.returncode:
                issues.append('JavaScript syntax: ' + result.stderr.strip()[:500])
        data_path = directory / 'data.json'
        data_path.write_text(json.dumps(config))
        # Execute OUR runtime against data, never arbitrary scripts from the page.
        validator = """
const fs = require('node:fs');
const Dash = require(process.argv[1]);
const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const engine = Dash.createEngine(data);
Object.keys(data.calcs || {}).forEach(id => engine.calc(id));
for (const chart of Object.values(data.charts || {})) {
  if (chart.type === 'funnel') chart.items.forEach(item => engine.calc(item.calc));
  else if (chart.type === 'table') {
    for (const column of chart.columns || []) engine.requireField(chart.source, column.field);
    engine.table(chart.source);
  } else {
    if (!['line','bar','stack','mini-list'].includes(chart.type)) throw new Error('Unknown chart type');
    engine.group(chart);
    if (chart.type === 'stack') engine.requireField(chart.source, chart.series);
  }
}
"""
        result = subprocess.run([node, '-e', validator, str(ROOT / 'assets' / 'dash.js'), str(data_path)], capture_output=True, text=True, timeout=30)
        if result.returncode:
            issues.append('Runtime data validation: ' + result.stderr.strip()[:1000])
    return issues


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('html', type=Path)
    args = parser.parse_args()
    issues = check(args.html)
    for issue in issues:
        print(issue)
    if not issues:
        print('OK: references, numeric annotations, unique IDs, JS syntax and data operations')
    raise SystemExit(bool(issues))
