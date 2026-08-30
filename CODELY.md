# CODELY.md

Yuumix Code 个人网站 — 基于 [Zensical](https://zensical.org/) 静态站点生成器的个人知识库 / 数字花园，部署在 GitHub Pages。

## 项目概述

- **站点名**：歪歪空间（yuumixcode.github.io）
- **定位**：Unity 插件作者的个人知识库，收录 Aesir 架构、Odin Inspector、Unity 技术笔记、Scripting API 文档、AI 工具笔记等
- **技术栈**：Python 3.13 + Zensical（Material for MkDocs 团队打造的新一代 SSG）+ Markdown 内容 + GitHub Pages 部署
- **作者**：yuumixcode（Runestone / 符文石）

## 目录结构

```
.
├── docs/                  # Zensical 内容源（所有 Markdown 从这里出发）
│   ├── index.md           # 自定义首页（像素风 + 对话框动效，非普通文档）
│   ├── stylesheets/       # 自定义 CSS (extra.css)
│   ├── assets/            # 图片资源（avatar.png/svg 等）
│   ├── aesir-architecture/  # Aesir Architecture 包文档
│   ├── aesir-modules/       # Aesir Modules 包文档
│   ├── aesir-inspector/     # Aesir Inspector 包文档
│   ├── odin-inspector/      # Odin Inspector 实战笔记
│   ├── unity-knowledge/     # Unity 通用技术沉淀（按子主题分子目录）
│   ├── scripting-api/       # 自动生成的 Scripting API 文档
│   ├── zensical/            # Zensical 工具使用笔记
│   └── ai/                  # AI skill / 工具集成笔记
├── others/                # 非 Zensical 资源（不进 build，不入 zensical 范围）
│   ├── ai-skills/          # 觉得不错的 AI skill 存档
│   ├── deploy-notes/       # 部署相关笔记
│   ├── tools/              # 仓库级脚本（如 png_to_svg.py）
│   ├── video-scripts/      # 视频录制逐字稿
│   └── yuumix-ip/          # 个人 IP / 头像产物
├── zensical.toml           # 站点配置（导航 / 主题 / 字体 / 特性）
├── AGENTS.md               # 项目级规范（命名 / 目录 / 导航 / 构建，所有 AI 助手必读）
├── .github/workflows/      # GitHub Actions CI/CD
│   └── docs.yml            # 构建 + 部署到 GitHub Pages
├── .venv/                  # Python 隔离环境（不入仓）
└── site/                   # 构建产物（不入仓，zensical build 生成）
```

## 构建与运行

```bash
# 1. 激活隔离环境
source .venv/bin/activate

# 2. 启动开发服务器（实时预览，修改 docs/ 自动刷新）
zensical serve
# 浏览器打开 http://localhost:8000

# 3. 构建静态站点
zensical build --clean

# 4. 查看版本
zensical --version
```

> 若 `.venv/` 不存在，恢复方法：`python3 -m venv .venv && source .venv/bin/activate && pip install zensical`

## 部署

- **方式**：GitHub Actions 自动部署到 GitHub Pages
- **触发**：push 到 `master` / `main` 分支，或手动 `workflow_dispatch`
- **流程**：`.github/workflows/docs.yml` — checkout → setup Python → `pip install zensical` → `zensical build --clean` → 上传 `site/` 产物 → 部署 Pages
- **并发控制**：`concurrency.group: pages`，`cancel-in-progress: false`（排队不取消，避免互相覆盖）

## 关键约定（摘要）

> **完整规范见 [AGENTS.md](AGENTS.md)** — 所有 AI 编码助手及人工协作必读。以下为高频要点。

### 命名

| 维度 | 规则 | 示例 |
| --- | --- | --- |
| 导航显示 | 中文，品牌/工具名保留英文 | 首页 / Aesir Architecture / Unity 知识库 |
| 目录名 | 全英文小写，多词用 `-` 连接 | `aesir-architecture/` `unity-knowledge/` |
| 文件名 | 全英文小写，多词用 `-` 连接 | `unity-localization-pitfall-log.md` |

### 导航（nav）

`zensical.toml` 的 `nav` 是**手写**的，不要删除也不要让 Zensical 自动推导。新加页面：在 `docs/<子目录>/` 放 `.md`，然后同步往 `nav` 列表里加一行。顺序按 `dir / 文件名` 字典序。

### 根目录铁律

`docs/` 是 Zensical 的源，`others/` 是 Zensical 之外的东西，**两者不要混**。临时/个人/AI 资源一律进 `others/` 再按主题分子目录。

### 内部链接

跨页面跳转用相对 `.md` 路径（Zensical build 时自动 resolve），不要用绝对 URL。

### 构建验证

修改 `zensical.toml` 或 `docs/` 后**必须** `zensical build --clean` 一次，确认没 broken link 再提交。

## 字体配置

- **正文中英文**：霞鹜文楷 LXGW WenKai（zeoseven CDN）
- **代码字体**：JetBrains Mono（font.im 反代 Google Fonts）
- **像素字体**：Press Start 2P（标题）+ VT323（对白），用于首页像素风

## 工具脚本

- `others/tools/png_to_svg.py` — 像素艺术 PNG → SVG 转换器（2D 矩形合并），用于将 avatar.png 转为矢量 logo。用法：`python3 others/tools/png_to_svg.py <input.png> <output.svg>`

## 不入仓

`.gitignore` 已覆盖：`.venv/`、`site/`、`.cache/`、`.DS_Store`、`__pycache__/`、`*.log`、`trace.json` 等。不要提交 `site/`（build 产物）、`.venv/`（本地环境）或二进制音频资源。
