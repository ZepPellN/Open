import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


def module(name):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / (name + '.py'))
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


class ToolsTest(unittest.TestCase):
    def test_profile_marks_missing_values_and_duplicate_records(self):
        profile = module('profile_data')
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'data.csv'
            path.write_text('date,channel,revenue\n2026-04-01,自然,10\n2026-04-01,自然,10\n2026-05-01,社群,\n', encoding='utf-8')
            result = profile.profile(path)
            self.assertEqual(result['rows'], 3)
            self.assertEqual(result['duplicate_records'], 1)
            self.assertEqual(result['columns']['revenue']['missing'], 1)
            self.assertEqual(result['columns']['date']['type'], 'date')

    def test_build_escapes_script_end_and_embeds_all_dependencies(self):
        build = module('build')
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            (base / 'data.csv').write_text('name,value\n</script><img src=x>,1\n', encoding='utf-8')
            (base / 'dashboard.json').write_text(json.dumps({'sources': {'s': {'file': 'data.csv'}}}), encoding='utf-8')
            output = base / 'out.html'
            build.build(ROOT / 'assets' / 'template.html', base / 'dashboard.json', output)
            html = output.read_text()
            self.assertIn('\\u003c/script>', html)
            self.assertNotIn('<img src=x>', html)
            self.assertNotIn('src="dash.js"', html)
            self.assertNotIn('{{', html)

    def test_build_rejects_placeholder_injection_and_accidental_overwrite(self):
        build = module('build')
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            config = base / 'dashboard.json'
            config.write_text('{"sources": {}}')
            with self.assertRaises(ValueError):
                build.build(ROOT / 'assets' / 'template.html', config, config)
            template = base / 'page.html'
            template.write_text('<script>{{DATA}}</script>{{CSS}}')
            with self.assertRaises(ValueError):
                build.build(template, config, base / 'out.html')

    def test_static_check_detects_duplicate_ids_missing_calc_unmarked_number_and_js_error(self):
        check = module('check')
        page = '<html><div id="a">增长 42%</div><div id="a" data-calc="nope"></div><script id="dashboard-data" type="application/json">{"sources":{},"calcs":{}}</script><script>let = ;</script></html>'
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'bad.html'
            path.write_text(page)
            issues = '\n'.join(check.check(path))
            for category in ['duplicate id', 'unknown calc', 'unmarked number', 'JavaScript']:
                self.assertIn(category, issues)

    def test_sample_build_check_and_runtime_validation(self):
        build = module('build')
        check = module('check')
        with tempfile.TemporaryDirectory() as directory:
            out = Path(directory) / 'dashboard.html'
            build.build(ROOT / 'examples' / 'sample' / 'page.html', ROOT / 'examples' / 'sample' / 'dashboard.json', out)
            self.assertEqual(check.check(out), [])

    def test_check_rejects_false_source_annotation(self):
        check = module('check')
        page = '<span data-source="missing" data-field="x">42</span><script id="dashboard-data" type="application/json">{"sources":{},"calcs":{}}</script>'
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'bad.html'
            path.write_text(page)
            self.assertIn('unknown source', '\n'.join(check.check(path)))

    def test_package_contains_essential_resources_not_local_data_or_caches(self):
        package = module('package')
        from zipfile import ZipFile
        with tempfile.TemporaryDirectory() as directory:
            archive = package.package(directory)
            names = ZipFile(archive).namelist()
            self.assertIn('open-dashboard/SKILL.md', names)
            self.assertIn('open-dashboard/assets/dash.js', names)
            self.assertFalse(any('__pycache__' in name or '.dev/' in name or '/dist/' in name for name in names))
            self.assertEqual(archive.read_bytes(), Path(directory, 'open-dashboard.skill').read_bytes())

    def test_static_source_binding_requires_exact_record_not_just_a_cosmetic_marker(self):
        check = module('check')
        page = '<span data-source="s" data-field="x">42</span><script id="dashboard-data" type="application/json">{"sources":{"s":{"csv":"x\\n1"}}}</script>'
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'bad.html'
            path.write_text(page)
            self.assertIn('data-record', '\n'.join(check.check(path)))

    def test_direct_source_checks_share_bom_and_blank_record_semantics_with_runtime(self):
        check = module('check')
        config = {'sources': {'s': {'csv': '\ufeffx\n\n42\n'}}}
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'cell.html'
            prefix = '<span data-source="s" data-field="x" data-record="2"></span>'
            data = '<script id="dashboard-data" type="application/json">' + json.dumps(config) + '</script>'
            path.write_text(prefix + data)
            self.assertEqual(check.check(path), [])
            path.write_text(prefix.replace('data-record="2"', 'data-record="3"') + data)
            self.assertIn('Invalid data-record', '\n'.join(check.check(path)))


if __name__ == '__main__':
    unittest.main()
