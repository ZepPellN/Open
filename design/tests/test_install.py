import importlib.util
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("portable_installer", ROOT / "install.py")
installer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(installer)


class StandaloneInstallTest(unittest.TestCase):
    def test_installs_self_contained_source_and_preserves_existing_install(self):
        with tempfile.TemporaryDirectory() as temporary:
            destination = Path(temporary) / installer.SKILL
            installer.install(destination)
            for required in ("SKILL.md", "AGENTS.md", "README.md", "LICENSE", "install.py", "run.py", "examples", "tests"):
                self.assertTrue((destination / required).exists(), required)
            self.assertFalse((destination / "node_modules").exists())
            self.assertFalse((destination / "dist").exists())
            marker = destination / "user-changes.txt"
            marker.write_text("keep me")
            with self.assertRaises(FileExistsError):
                installer.install(destination)
            self.assertEqual(marker.read_text(), "keep me")

    def test_destination_cannot_overwrite_source(self):
        with self.assertRaises(ValueError):
            installer.install(ROOT)
        with self.assertRaises(ValueError):
            installer.install(ROOT / "copied")

    def test_secret_and_dependency_exclusions(self):
        excluded = installer.ignore_files(".", [".env", ".env.local", ".env.example",
                                                "node_modules", ".git", "LICENSE", "debug.log"])
        self.assertIn(".env", excluded)
        self.assertIn(".env.local", excluded)
        self.assertIn("node_modules", excluded)
        self.assertNotIn(".env.example", excluded)
        self.assertNotIn("LICENSE", excluded)


if __name__ == "__main__":
    unittest.main()
