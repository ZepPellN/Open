# Open

[English](README.md) | 简体中文

三个可以独立使用的 Agent Skill，放在同一个 GitHub 开源仓库中。

| 项目 | 用途 | 说明 |
| --- | --- | --- |
| Open Slides | 浏览器幻灯片，编辑文字、保存 HTML、点按钮导出 PPTX、打印 PDF | [slides/README.md](slides/README.md) |
| Open Dashboard | 本地分析、交互看板、数字来源追溯 | [dashboard/README.md](dashboard/README.md) |
| Open Design | 使用现有 Agent 制作网页、原型、设计系统等视觉作品 | [design/README.md](design/README.md) |

每个目录包含源码、README、AGENTS.md、SKILL.md、安装入口、示例和测试。
没有跨目录运行依赖；不要求原作者机器上的路径或云账号。

## 安装和运行

```sh
git clone https://github.com/ZepPellN/Open.git
cd Open
```

进入想用的目录，执行：

```sh
python3 install.py
```

默认安装到 `~/.agents/skills/open-<name>`；已有目录不会被覆盖。
其他 Agent 可指定 `--destination /path/to/skill`，也可以不安装，直接读
对应目录的 AGENTS.md / SKILL.md。

告诉你的 Agent：

> 读取这个目录的 AGENTS.md 和 SKILL.md，按说明制作作品，打开实际预览地址并验证。

Slides 构建前先在 `slides/` 执行 `npm ci`。随后三个目录的入口一致：

```sh
python3 run.py demo
python3 run.py serve --open
python3 run.py test
```

预览只监听本机，打印真实 URL；`--open` 打开用户默认浏览器。
Agent 可以去掉该参数，在自己的浏览器预览打开输出的 URL。
示例输出在各自 `dist/index.html`，停止服务器按 Ctrl+C。

普通 Slides PPTX 导出在当前浏览器中完成，不另装 Chromium。
上游自动化 CLI / 截图导出是可选高级功能，不属于普通安装。

## 分享与许可

直接分享 GitHub 仓库地址。clone 后任选一个 Skill 目录，按它自己的说明使用。
源码和许可保留在 Git；依赖、缓存、生成结果和凭据不提交。不需要额外的下载包
或打包步骤。

Open 自编代码是 MIT。baoyu-design、PptxGenJS、JSZip 和其他上游材料保留各自
版权和许可；见 [来源说明](docs/provenance.md)。不含 BaoCut 实现，没有将其
社区许可改名为 MIT。这不是 Anthropic 官方产品，也不声称完整云端产品等价。

## 验证与发布

各目录用 `python3 run.py test`；根目录独立安装测试用
`python3 -m unittest discover -s tests`。GitHub Actions 运行这些测试，不安装浏览器。
见 [验证记录](docs/verification.md)。

发布需要操作者自己的 GitHub 登录，仓库不包含访问 token。
