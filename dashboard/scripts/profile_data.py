#!/usr/bin/env python3
"""CSV profile: missingness, numeric/date candidates, duplicates and grain hints."""
import argparse
import csv
from datetime import datetime
import json
import math
from pathlib import Path
import re


def profile(path):
    path = Path(path)
    with path.open(encoding='utf-8-sig', newline='') as handle:
        records = list(csv.reader(handle, strict=True))
    records = [row for row in records if row]
    if not records:
        raise ValueError('CSV needs a header')
    headers = records.pop(0)
    if len(set(headers)) != len(headers) or any(not name.strip() for name in headers):
        raise ValueError('Empty or duplicate CSV header')
    if any(len(row) != len(headers) for row in records):
        raise ValueError('Inconsistent column count')
    columns = {}
    for i, header in enumerate(headers):
        values = [row[i] for row in records]
        present = [value for value in values if value.strip()]
        numeric = []
        for value in present:
            try:
                number = float(value)
                if math.isfinite(number):
                    numeric.append(number)
            except ValueError:
                pass
        dates = []
        for value in present:
            try:
                normalized = value + '-01' if re.fullmatch(r'\d{4}-\d{2}', value) else value
                datetime.fromisoformat(normalized)
                dates.append(value)
            except ValueError:
                pass
        kind = 'empty' if not present else 'number' if len(numeric) == len(present) else 'date' if len(dates) == len(present) else 'category'
        columns[header] = {'type': kind, 'missing': len(values) - len(present), 'distinct': len(set(present)), 'examples': list(dict.fromkeys(present))[:5]}
        if kind == 'number':
            columns[header].update(min=min(numeric), max=max(numeric), sum=sum(numeric))
        if kind == 'date':
            columns[header].update(start=min(dates), end=max(dates))
            columns[header]['range_note'] = 'Lexical ISO candidates; normalize formats/time zones before time analysis.'
    return {
        'file': str(path), 'rows': len(records), 'columns': columns,
        'duplicate_records': len(records) - len(set(tuple(row) for row in records)),
        'dimensions': [name for name, meta in columns.items() if meta['type'] in ('date', 'category')],
        'measures': [name for name, meta in columns.items() if meta['type'] == 'number'],
        'grain': 'Candidate dimensions only; confirm the business key with the user before joining or deduplicating.',
        'export_time': 'unknown unless supplied by the data owner',
        'long_table_hint': 'If different row types have different units or grain, split them before aggregation. Do not sum identifiers or ratios.',
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('csv', type=Path)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    content = json.dumps(profile(args.csv), ensure_ascii=False, indent=2, allow_nan=False)
    if args.output:
        if args.output.resolve() == args.csv.resolve():
            raise ValueError('Output must not overwrite source CSV')
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(content + '\n', encoding='utf-8')
    else:
        print(content)
