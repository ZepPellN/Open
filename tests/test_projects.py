import importlib.util
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = ("slides", "dashboard", "design")


def installer(project):
    spec = importlib.util.spec_from_file_location(f"install_{project}", ROOT / project / "install.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class StandaloneSkillsTest(unittest.TestCase):
    def test_each_skill_contains_source_docs_examples_tests_and_licenses(self):
        for project in PROJECTS:
            with self.subTest(project=project):
                source = ROOT / project
                for entry in ("README.md", "README.zh-CN.md", "AGENTS.md", "SKILL.md",
                              "install.py", "run.py", "LICENSE", "THIRD_PARTY_NOTICES.md"):
                    self.assertTrue((source / entry).is_file(), entry)
                self.assertTrue(any((source / "examples").rglob("*")))
                self.assertTrue(any((source / "tests").glob("test*")))

    def test_readmes_are_separate_with_language_links(self):
        for folder in (ROOT, *(ROOT / project for project in PROJECTS)):
            with self.subTest(folder=folder):
                self.assertIn("[简体中文](README.zh-CN.md)", (folder / "README.md").read_text())
                self.assertIn("[English](README.md)", (folder / "README.zh-CN.md").read_text())
                self.assertIn("## Install", (folder / "README.md").read_text())

    def test_source_only_copies_install_without_parent_repository(self):
        with tempfile.TemporaryDirectory() as temporary:
            workspace = Path(temporary)
            for project in PROJECTS:
                with self.subTest(project=project):
                    source = workspace / "isolated" / project
                    shutil.copytree(ROOT / project, source, ignore=installer(project).ignore_files)
                    destination = workspace / "installed" / f"open-{project}"
                    result = subprocess.run([sys.executable, str(source / "install.py"),
                                             "--destination", str(destination)],
                                            cwd=workspace, capture_output=True, text=True)
                    self.assertEqual(result.returncode, 0, result.stderr)
                    self.assertEqual((source / "LICENSE").read_bytes(),
                                     (destination / "LICENSE").read_bytes())
                    self.assertTrue((destination / "README.zh-CN.md").is_file())
                    self.assertFalse((destination / "node_modules").exists())
                    self.assertFalse((destination / "dist").exists())
                    if project != "slides":
                        result = subprocess.run([sys.executable, str(destination / "run.py"), "demo"],
                                                cwd=workspace, capture_output=True, text=True)
                        self.assertEqual(result.returncode, 0, result.stderr)
                        self.assertTrue((destination / "dist/index.html").is_file())

    def test_slides_retain_permitted_upstream_license(self):
        source = ROOT / "slides"
        self.assertTrue((source / "licenses/baoyu-design-MIT.txt").is_file())
        paths = [path for path in source.rglob("*") if path.is_file()
                 and not any(part in ("node_modules", "dist", ".dev", "__pycache__") for part in path.parts)]
        self.assertFalse(any("baocut" in str(path.relative_to(source)).lower() for path in paths))
        self.assertFalse(any("BaoCut Community License" in path.read_text(errors="ignore") for path in paths))

    def test_dashboard_example_is_synthetic(self):
        self.assertTrue((ROOT / "dashboard/examples/sample/sample.csv").is_file())
        self.assertFalse((ROOT / "dashboard/examples/baocut").exists())


if __name__ == "__main__":
    unittest.main()
