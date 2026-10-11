#!/usr/bin/env python3
"""Independent pandas analysis, compared with runtime-derived sample values."""
import argparse
import json
from pathlib import Path
import pandas as pd

parser = argparse.ArgumentParser()
parser.add_argument('--output', type=Path)
args = parser.parse_args()
frame = pd.read_csv(Path(__file__).with_name('sample.csv'))
assert not frame.duplicated(['month', 'channel']).any(), 'Unexpected duplicate business key'
assert frame[['revenue', 'orders', 'visits', 'trials']].notna().all().all()
revenue = float(frame.revenue.sum())
orders = int(frame.orders.sum())
result = {'kind': 'synthetic', 'grain': 'month × channel', 'revenue': revenue, 'orders': orders,
          'aov': revenue / orders if orders else None,
          'monthly_revenue': frame.groupby('month').revenue.sum().to_dict(),
          'channel_revenue': frame.groupby('channel').revenue.sum().to_dict(),
          'limitations': 'Demonstration only; no refunds, tax or unique-user semantics.'}
content = json.dumps(result, ensure_ascii=False, indent=2)
if args.output:
    if args.output.resolve() == Path(__file__).with_name('sample.csv').resolve():
        raise ValueError('Do not overwrite source data')
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(content + '\n', encoding='utf-8')
else:
    print(content)
