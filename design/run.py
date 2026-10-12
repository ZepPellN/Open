#!/usr/bin/env python3
"""Build the bundled example or preview it in your own browser."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import shutil
import subprocess
import sys
import webbrowser

ROOT = Path(__file__).resolve().parent
PROJECT = "Open Design"


def command(*args):
    subprocess.run(args, cwd=ROOT, check=True)


def demo():
    (ROOT / "dist").mkdir(exist_ok=True)
    shutil.copyfile(ROOT / "examples/hello-design.html", ROOT / "dist/index.html")
    return ROOT / "dist" / "index.html"


def test():
    # Expand paths here so older supported Node versions need no CLI glob support.
    test_files = sorted((ROOT / "skills/baoyu-design/agents/tests").glob("*.test.mjs"))
    command("node", "--test", *(str(path.relative_to(ROOT)) for path in test_files))
    command(sys.executable, "-m", "unittest", "discover", "-s", "tests", "-p", "test_*.py")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("demo", "serve", "test"))
    parser.add_argument("--port", type=int, default=0, help="Loopback port; 0 selects an available one.")
    parser.add_argument("--open", action="store_true", help="Open the preview in the system default browser.")
    args = parser.parse_args()
    if args.action == "test":
        test()
    elif args.action == "demo":
        print(demo())
    else:
        if not (ROOT / "dist" / "index.html").exists():
            demo()
        handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT / "dist"))
        server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
        url = f"http://127.0.0.1:{server.server_port}/index.html"
        print(f"{PROJECT}: {url}", flush=True)
        if args.open:
            webbrowser.open(url)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
        finally:
            server.server_close()


if __name__ == "__main__":
    try:
        main()
    except (OSError, subprocess.CalledProcessError) as error:
        print(f"{error}\nRead README.md for the required installation step.", file=sys.stderr)
        sys.exit(1)
