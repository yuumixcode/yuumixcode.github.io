# AGENTS.md

> 项目级规范,Yuumix Code 个人主页(基于 Zensical)。所有 AI 编码助手(OpenCode/Codex/Cursor/Aider/Devin/Gemini CLI 等)以及人工协作都应遵守。

## 1. 命名规范(强制)

| 维度 | 规则 | 示例 |
| --- | --- | --- |
| **导航显示** | 中文,品牌/工具名保留英文 | 首页 / Aesir Architecture / Unity 知识库 |
| **目录名** | 全英文小写,多词用 `-` 连接 | `aesir-architecture/` `unity-knowledge-base/` |
| **文件名** | 全英文小写,多词用 `-` 连接 | `unity-localization-pitfall-log.md` `add-video.md` |
| **路径** | 目录 + 文件名全程英文 `-` 风格 | `unity-knowledge-base/localization/unity-localization-pitfall-log.md` |

**为什么分开**:目录/路径要稳定,URL/链接/脚本都依赖它;导航显示可以随语种调整。两者解耦后改语言或品牌名不会影响链接。

## 2. 目录结构

```
.
├── AGENTS.md              # 本规范
├── README.md              # 项目说明(给人类)
├── zensical.toml          # Zensical 配置(导航/主题/特性)
├── docs/                  # Markdown 源(所有内容从这里出发)
│   ├── index.md           # 首页
│   ├── stylesheets/       # 自定义 CSS
│   ├── aesir-architecture/
│   ├── aesir-modules/
│   ├── aesir-inspector/
│   ├── odin-inspector/
│   ├── unity-knowledge-base/
│   │   ├── localization/
│   │   └── addressables/
│   ├── zensical/
│   ├── ai/                # AI skill / 工具集成笔记
│   └── presentations/     # bento 演示文稿资源(不进 nav,被 ai/ 页面 iframe 引用)
├── .venv/                 # Python 隔离环境(不入仓,运行时自动恢复)
└── site/                  # 构建产物(不入仓,`zensical build --clean` 重建)
```

### 2.1 顶级 Header(6 个,固定)

| Header | 路径 | 用途 |
| --- | --- | --- |
| 首页 | `index.md` | 网站入口、介绍、导览 |
| Aesir Packages | `aesir-architecture/`、`aesir-modules/`、`aesir-inspector/` | Aesir 系列三个包收纳到一个 Header 下,各包作为子分组 |
| Odin Inspector | `odin-inspector/` | Odin Inspector 实战笔记 |
| Unity | `unity-knowledge-base/` | Unity 通用技术沉淀(按子主题分子目录) |
| Zensical | `zensical/` | 静态站工具本身的使用笔记 |
| AI | `ai/` | AI skill / 工具集成笔记(如 qiaomu-bento-ppt) |

注:Aesir Packages 下面是三个平级子分组(Architecture / Modules / Inspector),不是再拆 header。

新增顶级 Header **必须** 跟用户确认,不要自动加。

### 2.2 Unity 知识库子目录约定

Unity 知识库是**按子主题**分子目录的「主题文件夹」,不是单页:

- 每个 Unity 子主题 = 一个子目录,目录名英文 `-` 风格
- 子目录下放 `index.md` + 若干专题 `.md`
- 例:`unity-knowledge-base/localization/` 下放 `unity-localization-pitfall-log.md` `localization-question.md` `slides/`

## 3. 导航(nav)约定

`zensical.toml` 的 `nav` 是**手写**的,不要删掉也不要让 zensical 自动推导。规则:

- 一级 = 顶级 Header,key 中文,value 是 `.md` 路径或嵌套 dict
- 二级及以上 = 子目录分组,key 中文,value 是 `.md` 路径列表
- 顺序按 `dir / 文件名` 字典序,不要按时间

新加页面:在 `docs/<子目录>/` 放 `.md`,然后同步往 `zensical.toml` 的 `nav` 列表里加一行。

## 4. 内部链接

跨页面跳转用相对 `.md` 路径,zensical 会在 build 时自动 resolve。例如:

```markdown
详见 [踩坑日志](unity-knowledge-base/localization/unity-localization-pitfall-log.md)
```

不要用绝对 URL(部署后会被 CDN 重写,本地开发又失效)。

## 5. 构建 & 验证

```bash
# 1. 激活环境(若 .venv 没了:python3 -m venv .venv && source .venv/bin/activate && pip install zensical)
source .venv/bin/activate

# 2. 本地预览
zensical serve                 # http://localhost:8000

# 3. 产出静态站
zensical build --clean         # 输出到 site/
```

修改 `zensical.toml` 或 `docs/` 后**必须** `zensical build --clean` 一次,确认没 broken link 再提交。

## 6. 不入仓的东西

`.gitignore` 已覆盖:`.venv/` `site/` `.cache/` `.DS_Store` `__pycache__/` `*.log` `trace.json` 等。

不要把以下提交进仓:
- `site/`(build 产物,部署用 Pages 自动跑)
- `.venv/`(各机器本地环境,差异大)
- `.DS_Store` 等 OS 元数据
- 任何 `audio/` `*.mp3` 之类的二进制资源(本项目不收录,需要图就放 `docs/assets/` 用相对路径引用)
