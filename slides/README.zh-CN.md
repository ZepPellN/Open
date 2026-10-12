# Open Slides

[English](README.md) | 简体中文

用自己的浏览器看幻灯片、编辑文字，点 **Export PPTX** 下载可编辑 PowerPoint，
点 **Save HTML** 保存作品，或通过 **Print / PDF** 保存 PDF。
PPTX 在当前浏览器生成，不需另装 Chrome/Chromium，不调用云服务。

## 安装、示例和测试

在这个目录内执行（Python 3.9+、Node.js 18+）：

```sh
python3 install.py                 # 可选：安装 Agent skill
npm ci                            # 仅安装 JSZip 和构建工具，不下载浏览器
python3 run.py demo
python3 run.py serve --open
python3 run.py test
```

从大仓库开始先 `cd slides`；单独拿走本目录则直接运行。
其他 Agent 可用 `python3 install.py --destination /path/to/open-slides`；
安装不会覆盖已有目录。也可直接让 Agent 读取 [AGENTS.md](AGENTS.md)
和 [SKILL.md](SKILL.md)。

## 制作和打开

请 Agent 按 SKILL.md 制作内容，使用 `examples/browser-deck.html` 中的静态
`<deck-stage>` / `<section>` 和控制栏。页面源在模板里，浏览器导出适配器
在 `src/`；MIT 上游运行时、捕获、渲染、动画源码在 `skills/baoyu-design/`。
构建器将这些源码合成 `dist/index.html`，可在普通现代浏览器离线打开。

Agent 预览时保持 `python3 run.py serve` 运行，打开它打印的真实 URL。
Save HTML 下载的文件包含当前文字和导出代码；浏览器修改不会直接覆盖磁盘源码。
修改模板后重新运行 demo。普通使用不用 Playwright、Node 服务 API 或云端模型。

原始 `examples/two-slide.html` 保留，供可选 CLI 的兼容性检查。

## 能力边界

这是本地 HTML 幻灯片与浏览器导出工具，不是完整 Claude Slides 云端编辑器。
支持文字编辑、导航和下载；没有云协作、服务端保存、任意元素拖拽布局。
原生 PPTX 近似转换文字、形状、图片和支持的动画，不保证与任意 HTML 像素一致。
尽量内联图片/字体；跨域图片缺少 CORS 时可能无法导出，请检查警告。
精确字体、布局及动画需在 PowerPoint / Keynote 中复核。

只有明确需要批量自动化或截图 PPTX 时，使用
[可选 CLI](references/export-pptx.md)。那条上游路径才需要独立的
Playwright 浏览器，不会在普通安装中启用。

## 来源与许可

Open 适配器、入口和示例用 [MIT](LICENSE)。上游来自 Jim Liu 宝玉的
baoyu-design，许可保留在 `licenses/baoyu-design-MIT.txt`。
vendored PptxGenJS 源码、补丁说明和许可完整保留。
构建依赖 JSZip 的许可在 `licenses/jszip-LICENSE.markdown`。
见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。不包含 BaoCut 源码。
