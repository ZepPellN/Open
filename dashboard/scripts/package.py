#!/usr/bin/env python3
"""Package essential skill resources as identical .zip and .skill archives."""
import argparse
from pathlib import Path
import shutil
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]


def package(output):
    output = Path(output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    archive = output / 'open-dashboard.zip'
    paths = [ROOT / 'SKILL.md', ROOT / 'LICENSE']
    for directory in ('agents', 'assets', 'scripts', 'references', 'examples'):
        paths.extend(path for path in (ROOT / directory).rglob('*') if path.is_file()
                     and '__pycache__' not in path.parts and path.name != 'visual-spec.md')
    with ZipFile(archive, 'w', ZIP_DEFLATED) as zipped:
        for path in paths:
            zipped.write(path, 'open-dashboard/' + path.relative_to(ROOT).as_posix())
    shutil.copyfile(archive, output / 'open-dashboard.skill')
    return archive


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    print(package(args.output))
