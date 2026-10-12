# Open Design

[English](README.md) | 简体中文

便携设计 Agent 项目，复用 Jim Liu 宝玉的 MIT **baoyu-design** 源码。
生成能力来自你已有的 Agent / 模型，不是另一个需要登录的云服务。
完整源码、工具、参考、素材和上游测试都在本目录内。

## 安装、示例和测试

在本目录执行（Python 3.9+；上游工具与测试需 Node.js 18+）：

```sh
python3 install.py
python3 run.py demo
python3 run.py serve --open
python3 run.py test
```

默认安装到 `~/.agents/skills/open-design`；其他 Agent 可指定
`--destination /path/to/open-design`。安装不会覆盖已有目录。
从大仓库开始先 `cd design`；单独拿走本目录则直接执行。

## Agent 使用

读取 [AGENTS.md](AGENTS.md)、[SKILL.md](SKILL.md)，再按任务读取
`skills/baoyu-design/SKILL.md` 及相应 built-in skill / harness reference。
例如：“用 Open Design 为这份产品说明做一个交互网页，本地预览并验证。”

源码在 `skills/baoyu-design/`；测试在其 `agents/tests/` 及本目录 `tests/`。
`examples/hello-design.html` 是自编、离线、可修改的最小作品，不冒称 AI 编辑器。
demo 将它生成到 `dist/index.html`；serve 启动仅本机的预览。
实际任务作品由 Agent 放在用户指定的输出目录。

普通网页设计不用额外 Chromium。图片生成、视频、Figma 导入、自动化 PPTX
有各自可选依赖，只在实际需要时按相应文档安装。

## 来源与许可

上游 MIT [LICENSE](LICENSE) 保持原样；原始 README 在
[UPSTREAM_README.md](UPSTREAM_README.md)。Open 新增入口、包装及示例适用
`licenses/open-wrapper-MIT.txt`。素材、字体及 vendored 库保留各自版权/许可。
见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
这是源码复用，不声称我们用 REA 完整逆向了官方 Claude Design 服务。
