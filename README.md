# Yuumix 的个人网站（基于 Zensical）

基于 [Zensical](https://zensical.org/)（Material for MkDocs 团队打造的新一代静态站点生成器）的最小可用个人网页项目。

## 项目结构

```
.
├── docs/                 # Markdown 内容源文件
│   ├── index.md          # 首页
│   ├── about.md          # 关于
│   └── notes.md          # 测试笔记
├── zensical.toml         # 站点配置（站点名、导航、主题）
├── .venv/                # Python 隔离环境
└── site/                 # 构建产物（zensical build 生成）
```

## 环境要求

- Python 3.10+（本项目使用 3.13）

## 本地运行

```bash
# 1. 激活隔离环境
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

> 新增页面：在 `docs/` 下添加 `.md` 文件，并在 `zensical.toml` 的 `nav` 中登记即可。
