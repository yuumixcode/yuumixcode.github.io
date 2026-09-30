# CODELY.md

Yuumix Code 个人网站 — 基于 [Zensical](https://zensical.org/) 静态站点生成器的个人知识库 / 数字花园，部署在 GitHub Pages。

## 项目概述

- **站点名**：歪歪空间（yuumixcode.github.io）
- **定位**：Unity 插件作者的个人知识库，收录 Aesir Inspector、Unity 技术笔记、博客（含 Odin Inspector 系列）、AI 工具笔记等；Aesir Architecture / Modules 文档与 Scripting API 已迁至独立站点/仓库
- **技术栈**：Python 3.13 + Zensical（Material for MkDocs 团队打造的新一代 SSG）+ Markdown 内容 + GitHub Pages 部署
- **作者**：yuumixcode（Runestone / 符文石）

## 目录结构

```
.
├── docs/                  # Zensical 内容源（所有 Markdown 从这里出发）
│   ├── index.md           # 自定义首页（像素风 + 对话框动效，非普通文档）
│   ├── stylesheets/       # 自定义 CSS (extra.css)
│   ├── assets/            # 图片资源（avatar.png/svg 等）
│   ├── aesir-inspector/     # Aesir Inspector 包文档（Architecture/Modules 已迁至 yuumixcode.github.io/AesirFramework-Docs/）
│   ├── unity-knowledge/     # Unity 通用技术沉淀（按子主题分子目录）
│   ├── blog/                # 博客(Zensical 0.0.65+ 内置 Blog 插件;入口 index.md + .authors.yml + posts/,Odin 系列在 posts/odin-inspector/)
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

## Codely Structured Memories

### User

### Feedback

### Project
- [2026-09-30 23:38:44] [2026-09-30] 站点新增顶级导航「博客」(docs/blog/,Zensical 0.0.65+ 内置 Blog 插件,`[project.plugins.blog]`;nav 只写入口 `{ "博客" = ["blog/index.md"] }`)。坑:博客日期默认**不按站点语言本地化**(language="zh" 也输出 September 30, 2026 / Wednesday),且 `post_date_format` 用的是 **ICU 模式语法而非 strftime**——`%Y-%m-%d` 会被逐字母替换成 `%Y-%0-%30`;正确写法 `y年M月d日`→2026年9月30日(字母映射:a=AM/PM、y=年、M=月、d=日、H=24时、h=12时、m=分、s=秒、E=星期)。文章文件名/slug 必须英文(默认 slug 取标题,中文标题会生成中文 URL)。AGENTS.md 已同步(§2.1 顶级 Header 7 个、新增 §2.3 博客约定)。
- [2026-10-01 00:01:40] [2026-10-01] 站点文档大梳理：①docs/scripting-api/ 已删除（Scripting API 迁到独立仓库），nav 整块移除；②docs/aesir-architecture/ 与 docs/aesir-modules/ 已删除，文档迁至 https://yuumixcode.github.io/AesirFramework-Docs/ ，nav 的「Aesir Packages」下仅留一个指向该站的外链钩子 + 本地 aesir-inspector/（保留）；③docs/odin-inspector/ 8 篇文档迁入 docs/blog/posts/odin-inspector/（带 front matter：date 取 git 首次提交日期、slug 英文、categories=[Odin Inspector]、<!-- more --> 摘要），「Odin Inspector」顶级 nav 已移除；④blog/index.md 新增「Unity 中文社区」分区说明区块（Odin 系列即该专栏内容）。顶级 Header 从 7 个变 6 个：首页/博客/Aesir Packages/Unity/Zensical/AI。Zensical nav 支持直接写 https:// 外链（0.0.67 实测构建通过）。AGENTS.md 已同步。

### Reference

