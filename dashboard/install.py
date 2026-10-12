#!/usr/bin/env python3
"""Install this directory as a portable Agent skill; never overwrite an install."""
import argparse
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent
SKILL = "open-dashboard"
EXCLUDED = {".git", ".dev", ".scratch", "__pycache__", ".pytest_cache",
            "node_modules", "dist", "coverage"}
ENV_TEMPLATES = {".env.example", ".env.sample", ".env.template"}


def ignore_files(directory, names):
    return [name for name in names if name in EXCLUDED or name == ".DS_Store"
            or name.lower().endswith((".log", ".pyc", ".pem", ".key"))
            or ((name == ".env" or name.startswith(".env.")) and name not in ENV_TEMPLATES)]


def install(destination):
    destination = Path(destination).expanduser().absolute()
    source = ROOT.resolve()
    resolved = destination.resolve()
    if resolved == source or source in resolved.parents or resolved in source.parents:
        raise ValueError("Install destination must be outside the source directory.")
    if destination.exists() or destination.is_symlink():
        raise FileExistsError(f"Already exists, left unchanged: {destination}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source, destination, ignore=ignore_files)
    return destination


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--destination", type=Path,
                        default=Path.home() / ".agents" / "skills" / SKILL,
                        help="Exact destination skill directory; must not exist.")
    args = parser.parse_args()
    try:
        print(install(args.destination))
        print("Installed source and licenses. Reload your Agent, or read AGENTS.md directly.")
        print("No browser, model service or optional exporter has been installed.")
    except (ValueError, OSError) as error:
        parser.exit(1, f"{error}\n")
