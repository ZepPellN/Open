# Open Dashboard

[English](README.md) | 简体中文

独立的本地看板项目，参考原微博第四张图中的工作流自建。
不是恢复出的 Claude 官方源码，也不是作者尚未取得的 skill 附件。

## 安装、示例和测试

在本目录执行（Python 3.9+；测试需 Node.js 18+）：

```sh
python3 install.py
python3 run.py demo
python3 run.py serve --open
python3 run.py test
```

默认安装到 `~/.agents/skills/open-dashboard`；其他 Agent 可指定
`--destination /path/to/open-dashboard`，已有目录不覆盖。
也可直接读取 [AGENTS.md](AGENTS.md) 和 [SKILL.md](SKILL.md)。
从大仓库开始先 `cd dashboard`；单独拿走本目录则直接执行。

示例生成在 `dist/index.html`。预览只监听本机并打印真实 URL；
`--open` 打开默认浏览器。HTML 自包含，普通浏览器离线可用，不需额外
服务器、CDN、模型或 Chromium。最小示例不需要 pandas / uv。

## 分析自己的数据

按 SKILL.md 的 画像 → 分析 → 写页面 → 检查 → 交付 工作流执行。
源码在 `assets/`、`scripts/`、`references/`；合成示例在 `examples/sample/`。

```sh
python3 scripts/profile_data.py examples/sample/sample.csv --output dist/profile.json
python3 scripts/build.py examples/sample/page.html examples/sample/dashboard.json dist/dashboard.html
python3 scripts/check.py dist/dashboard.html
```

可选的 pandas 独立分析：

```sh
uv run --with pandas python examples/sample/analyze.py --output dist/analysis.json
```

支持筛选、排序、六类图表/表格、明暗主题及数字到内嵌源记录的追溯。
XLSX 先本地转换 CSV；复杂清洗/联接由 Agent 的本地分析工具完成。

## 分享边界

示例显著标注为合成数据。生成 HTML 包含完整源 CSV，包括未展示列；
分享前应脱敏或聚合。来源面板追溯内嵌 CSV，不会自动还原所有上游清洗步骤。

## 许可

独立实现使用 [MIT](LICENSE)。
