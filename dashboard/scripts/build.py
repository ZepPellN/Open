#!/usr/bin/env python3
"""Inline the trusted page, runtime, styles and CSV into one offline HTML."""
import argparse
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def build(template, config_path, output):
    template, config_path, output = map(lambda p: Path(p).resolve(), (template, config_path, output))
    config = json.loads(config_path.read_text(encoding='utf-8'))
    inputs = {template, config_path, ROOT / 'assets' / 'dash.js', ROOT / 'assets' / 'dash.css'}
    for source in config.get('sources', {}).values():
        if 'file' in source:
            csv_path = (config_path.parent / source['file']).resolve()
            inputs.add(csv_path)
            source['csv'] = csv_path.read_text(encoding='utf-8-sig')
        elif 'csv' not in source:
            raise ValueError('Each source needs file or csv')
    if output in inputs:
        raise ValueError('Output must not overwrite an input or runtime asset')
    page = template.read_text(encoding='utf-8')
    for token in ('CSS', 'DATA', 'JS'):
        if page.count('{{' + token + '}}') != 1:
            raise ValueError('Template needs exactly one {{' + token + '}} token')
    data = json.dumps(config, ensure_ascii=False, allow_nan=False).replace('<', '\\u003c').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    replacements = {
        'CSS': (ROOT / 'assets' / 'dash.css').read_text(encoding='utf-8'),
        'DATA': data,
        'JS': (ROOT / 'assets' / 'dash.js').read_text(encoding='utf-8'),
    }
    # One pass: data containing a template-looking token is never re-interpreted.
    page = re.sub(r'\{\{(CSS|DATA|JS)\}\}', lambda match: replacements[match[1]], page)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(page, encoding='utf-8')
    return output


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('template', type=Path)
    parser.add_argument('config', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    print(build(args.template, args.config, args.output))
