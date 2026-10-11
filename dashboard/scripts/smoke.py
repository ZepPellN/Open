#!/usr/bin/env python3
"""Headless smoke test of trusted local HTML over loopback; no user profile."""
import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import threading


def smoke(html, output, browser=None):
    from playwright.sync_api import sync_playwright
    html, output = Path(html).resolve(), Path(output).resolve()
    if output == html or output.is_file():
        raise ValueError('Screenshot directory cannot overwrite a file')
    content = html.read_bytes()
    output.mkdir(parents=True, exist_ok=True)

    class PageHandler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path != '/dashboard.html':
                self.send_error(404)
                return
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)

        def log_message(self, *_):
            pass

    server = ThreadingHTTPServer(('127.0.0.1', 0), PageHandler)
    runner = threading.Thread(target=server.serve_forever, daemon=True)
    runner.start()
    origin = f'http://127.0.0.1:{server.server_port}'
    issues = []
    observations = []
    try:
        with sync_playwright() as playwright:
            options = {'headless': True, 'chromium_sandbox': True}
            if browser:
                options['executable_path'] = str(Path(browser).resolve())
            chromium = playwright.chromium.launch(**options)
            context = chromium.new_context(viewport={'width': 1440, 'height': 1100})
            # No signed-in profile and no outbound requests, even for a bad template.
            context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(origin + '/') else route.abort())
            page = context.new_page()
            page.on('pageerror', lambda error: issues.append(f'JavaScript: {error}'))
            page.on('console', lambda msg: issues.append(f'console: {msg.text}') if msg.type == 'error' else None)
            page.goto(origin + '/dashboard.html', wait_until='load')
            page.wait_for_function("document.documentElement.dataset.dashboardReady === 'true' || document.documentElement.dataset.dashboardError", timeout=15000)
            error = page.evaluate('document.documentElement.dataset.dashboardError')
            if error:
                issues.append(error)
            for chart in page.locator('[data-chart]').all():
                if chart.evaluate('(element) => element.children.length') == 0:
                    issues.append('Unrendered chart: ' + chart.get_attribute('data-chart'))
            page.screenshot(path=str(output / 'desktop.png'), full_page=True)
            observations.append({'width': 1440, 'theme': 'light'})
            theme = page.locator('[data-theme-toggle]')
            if theme.count():
                theme.first.click()
                if page.evaluate('document.documentElement.dataset.theme') != 'dark':
                    issues.append('Theme did not switch to dark')
            page.screenshot(path=str(output / 'dark.png'), full_page=True)
            if theme.count():
                theme.first.click()
            page.set_viewport_size({'width': 390, 'height': 844})
            # Reload: SVG layout is chosen during render, just like a fresh mobile visit.
            page.reload(wait_until='load')
            page.wait_for_function("document.documentElement.dataset.dashboardReady === 'true'")
            dimensions = page.evaluate('({client:document.documentElement.clientWidth, scroll:document.documentElement.scrollWidth})')
            if dimensions['scroll'] > dimensions['client'] + 1:
                issues.append('Mobile document overflow: ' + str(dimensions))
            observations.append({'width': 390, 'theme': 'light', **dimensions})
            page.screenshot(path=str(output / 'mobile.png'), full_page=True)
            context.close()
            chromium.close()
    finally:
        server.shutdown()
        server.server_close()
        runner.join(timeout=5)
    report = {'issues': issues, 'observations': observations, 'screenshots': ['desktop.png', 'dark.png', 'mobile.png']}
    (output / 'smoke.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('html', type=Path)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--browser', type=Path, help='Existing Chromium/Chrome executable; never use a signed-in profile')
    args = parser.parse_args()
    report = smoke(args.html, args.output, args.browser)
    print(json.dumps(report, ensure_ascii=False))
    raise SystemExit(bool(report['issues']))
