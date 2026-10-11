import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile

from scripts.package_projects import ROOT, package_projects


class PackageProjectsTest(unittest.TestCase):
    def test_each_archive_is_standalone_and_keeps_licenses(self):
        with tempfile.TemporaryDirectory() as temporary:
            archives = package_projects(Path(temporary))
            self.assertEqual([path.name for path in archives], [
                "open-slides.zip", "open-dashboard.zip", "open-design.zip"
            ])
            for project, archive in zip(("slides", "dashboard", "design"), archives):
                with ZipFile(archive) as zipped:
                    names = zipped.namelist()
                    self.assertIn(f"{project}/README.md", names)
                    self.assertIn(f"{project}/LICENSE", names)
                    self.assertFalse(any("/.git/" in f"/{name}" for name in names))
                    self.assertFalse(any("/node_modules/" in f"/{name}" for name in names))
                    self.assertFalse(any("/.dev/" in f"/{name}" for name in names))

    def test_slides_package_has_no_baocut_source_or_community_license(self):
        with tempfile.TemporaryDirectory() as temporary:
            archive, *_ = package_projects(Path(temporary))
            with ZipFile(archive) as zipped:
                paths = [name.lower() for name in zipped.namelist()]
                self.assertFalse(any("baocut" in name for name in paths))
                texts = [zipped.read(name).decode("utf-8", "ignore") for name in zipped.namelist()]
                self.assertFalse(any("BaoCut Community License" in text for text in texts))
                self.assertTrue(any(name.endswith("baoyu-design-mit.txt") for name in paths))

    def test_dashboard_package_uses_synthetic_sample_only(self):
        with tempfile.TemporaryDirectory() as temporary:
            _, archive, _ = package_projects(Path(temporary))
            with ZipFile(archive) as zipped:
                names = [name.lower() for name in zipped.namelist()]
                self.assertIn("dashboard/examples/sample/sample.csv", names)
                self.assertFalse(any("examples/baocut/" in name for name in names))


if __name__ == "__main__":
    unittest.main()
