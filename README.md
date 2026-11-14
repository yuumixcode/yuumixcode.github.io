# 歪歪空间 · Yuumix 的个人网站

基于 [Zensical](https://zensical.org/)（Material for MkDocs 团队打造的新一代静态站点生成器）的个人知识库 / 数字花园，部署在 GitHub Pages：<https://yuumixcode.github.io/>。

内容板块：首页 / 博客（含 Odin Inspector 系列）/ Aesir Packages / Unity 知识库 / Zensical 笔记 / AI 工具笔记。

## 项目结构

```
.
├── docs/                 # Markdown 内容源（六大板块，详见 AGENTS.md）
├── others/               # 非站点资源（skill 存档 / 脚本 / 逐字稿等，不进 build）
├── zensical.toml         # 站点配置（导航 / 主题 / 字体 / 特性）
├── AGENTS.md             # 项目级规范（命名 / 目录 / 导航 / 构建）
├── .venv/                # Python 隔离环境（不入仓）
└── site/                 # 构建产物（不入仓，zensical build 生成）
```

## 环境要求

- Python 3.10+（本项目 venv 使用 3.14）
- Zensical（`pip install zensical`）

## 本地运行

```bash
# 1. 激活隔离环境（若 .venv 没了：python3 -m venv .venv && source .venv/bin/activate && pip install zensical）
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 2. 启动开发服务器（实时预览，修改 docs/ 自动刷新）
zensical serve
# 浏览器打开 http://localhost:8000
```

## 构建静态站点

```bash
zensical build --clean           # 输出到 site/ 目录
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `zensical serve` | 启动本地开发服务器 |
| `zensical build` | 构建静态站点 |
| `zensical build --clean` | 清理并重新构建 |
| `zensical --version` | 查看版本 |

> 新增页面：在 `docs/<子目录>/` 下添加 `.md`，并在 `zensical.toml` 的 `nav` 中登记；完整规范见 [AGENTS.md](AGENTS.md)。