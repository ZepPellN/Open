#!/usr/bin/env python3
"""Create three clean, independently downloadable Open project archives."""

from pathlib import Path
import argparse
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = ("slides", "dashboard", "design")
EXCLUDED_DIRS = {".git", ".dev", "__pycache__", ".pytest_cache", "node_modules", "dist", "coverage"}
ENV_TEMPLATES = {".env.example", ".env.sample", ".env.template"}


def should_include(relative_path: Path) -> bool:
    relative_path = Path(relative_path)
    if EXCLUDED_DIRS.intersection(relative_path.parts):
        return False
    name = relative_path.name
    lowered = name.lower()
    if name == ".DS_Store" or lowered.endswith((".log", ".pyc", ".pem", ".key")):
        return False
    if (name == ".env" or name.startswith(".env.")) and name not in ENV_TEMPLATES:
        return False
    return True


def package_projects(output_dir: Path) -> list[Path]:
    output_dir = Path(output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    archives = []
    for project in PROJECTS:
        source = ROOT / project
        if not (source / "README.md").is_file() or not (source / "LICENSE").is_file():
            raise FileNotFoundError(f"{project} must contain README.md and LICENSE")
        archive = output_dir / f"open-{project}.zip"
        with ZipFile(archive, "w", ZIP_DEFLATED) as zipped:
            for path in sorted(source.rglob("*")):
                if not path.is_file() or not should_include(path.relative_to(source)):
                    continue
                zipped.write(path, (Path(project) / path.relative_to(source)).as_posix())
        archives.append(archive)
    return archives


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "dist")
    args = parser.parse_args()
    for archive in package_projects(args.output):
        print(archive)
