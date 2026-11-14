# CODELY.md

Yuumix Code 个人网站 — 基于 [Zensical](https://zensical.org/) 静态站点生成器的个人知识库 / 数字花园，部署在 GitHub Pages。

## 项目概述

- **站点名**：歪歪空间（yuumixcode.github.io）
- **定位**：Unity 插件作者的个人知识库，收录 Aesir Inspector、Unity 技术笔记、博客（含 Odin Inspector 系列）、AI 工具笔记等；Aesir Architecture / Modules 文档与 Scripting API 已迁至独立站点/仓库
- **技术栈**：Python 3.14 + Zensical（Material for MkDocs 团队打造的新一代 SSG）+ Markdown 内容 + GitHub Pages 部署
- **作者**：yuumixcode（Runestone / 符文石）

## 目录结构

```
.
├── docs/                  # Zensical 内容源（所有 Markdown 从这里出发）
│   ├── index.md           # 自定义首页（像素风 + 对话框动效，非普通文档）
│   ├── stylesheets/       # 自定义 CSS (extra.css)
│   ├── assets/            # 图片资源（avatar.png/svg 等）
│   ├── aesir-inspector/     # Aesir Inspector 包文档（Architecture/Modules 已迁至 yuumixcode.github.io/AesirFramework-Site/）
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
- [2026-11-04 10:02:24] [2026-11-04] 清理类功能的硬约束：删除必须移入系统废纸篓/回收站（macOS Finder、Windows SendToRecycleBin），严禁硬删除；若某操作没有官方接口（如 Cowork 会话归档），就不实现，绝不直改内部数据库绕过。Why: 用户明确要求归档结果必须能在「团结 Cowork」界面体现，非官方写入既不可控也不可逆。
- [2026-11-04 15:45:39] [2026-11-04] 批量删除的硬规矩（血的教训）：调用 `osascript -e 'tell application "Finder" to delete POSIX file "..."'` 时**必须写死显式绝对路径**，绝不能用 `$PWD`/相对路径拼接——本会话就因 `$PWD` 指向项目根，把整个仓库移进了废纸篓（shell cwd 消失后所有命令都 spawn 失败）。补救路径：用 write_file 在目标路径写占位文件重建目录 → 用 `dotglob` 把废纸篓里的内容 `mv -n` 回来 → `rmdir` + 删占位。Why: Finder 的 delete 是整包移动，一条路径写错就是灾难级误删。How to apply: 删除前先 `test -d "$目标" && echo "$目标" | grep -q '^/Users/yuumix/.codely-cli/tmp/'` 之类的断言；命令里出现 `$PWD` 一律替换为变量并在回显中打印完整路径。
- [2026-11-04 15:47:18] [2026-11-04] 用户说「独立游戏的方案 / 选哪一项」时，指的是**文档里已有的方案条目（A–F 中的某一项）**，不是要新推荐产品/游戏类型。Why: 本次把「独立游戏方案」误读成「推荐一款游戏」，整轮答偏，用户纠正为「不是说选品，是说独立游戏这档选哪个场景方案」。How to apply: 遇到「XX 的方案」先回指已有方案编号确认（如「是指方案 B+C 吗」），再展开；含糊时先问一句，不要直接跳到新选题/新产品推荐。
- [2026-11-08 17:02:04] [2026-11-08] 调研「某 AI 工具是否免费/额度多少」时，中文搜索结果里的测评软文不可作为事实依据——本次同一任务被推翻三处：Kimi PPT 免费额度（软文称「每月个位数次数」，官网 FAQ 实际只说「有免费额度」未公布数值）、Marp 的 PPTX 可编辑性（软文称「能用」，README 原文是预渲染图片不可改）、腾讯智影（软文仍在推荐，实际 2025-06-30 已停服删数据）。Why: 这类文章多为引流/报价单，额度数字与产品存活状态都是过期或杜撰的，直接采信会把停服产品写进推荐清单。How to apply: 额度只认官网 pricing 页/帮助中心/GitHub README；无法登录看到的额度明确标「未公示」，不要用二手数字填空。

### Project
- [2026-09-30 23:38:44] [2026-09-30] 站点新增顶级导航「博客」(docs/blog/,Zensical 0.0.65+ 内置 Blog 插件,`[project.plugins.blog]`;nav 只写入口 `{ "博客" = ["blog/index.md"] }`)。坑:博客日期默认**不按站点语言本地化**(language="zh" 也输出 September 30, 2026 / Wednesday),且 `post_date_format` 用的是 **ICU 模式语法而非 strftime**——`%Y-%m-%d` 会被逐字母替换成 `%Y-%0-%30`;正确写法 `y年M月d日`→2026年9月30日(字母映射:a=AM/PM、y=年、M=月、d=日、H=24时、h=12时、m=分、s=秒、E=星期)。文章文件名/slug 必须英文(默认 slug 取标题,中文标题会生成中文 URL)。AGENTS.md 已同步(§2.1 顶级 Header 7 个、新增 §2.3 博客约定)。
- [2026-10-01 00:01:40] [2026-10-01] 站点文档大梳理：①docs/scripting-api/ 已删除（Scripting API 迁到独立仓库），nav 整块移除；②docs/aesir-architecture/ 与 docs/aesir-modules/ 已删除，文档迁至 https://yuumixcode.github.io/AesirFramework-Site/ ，nav 的「Aesir Packages」下仅留一个指向该站的外链钩子 + 本地 aesir-inspector/（保留）；③docs/odin-inspector/ 8 篇文档迁入 docs/blog/posts/odin-inspector/（带 front matter：date 取 git 首次提交日期、slug 英文、categories=[Odin Inspector]、<!-- more --> 摘要），「Odin Inspector」顶级 nav 已移除；④blog/index.md 新增「Unity 中文社区」分区说明区块（Odin 系列即该专栏内容）。顶级 Header 从 7 个变 6 个：首页/博客/Aesir Packages/Unity/Zensical/AI。Zensical nav 支持直接写 https:// 外链（0.0.67 实测构建通过）。AGENTS.md 已同步。
- [2026-10-14 13:03:58] [2026-10-14] 用户 2026-10-17/18 周末参加 24h 线下 AI Native Game Jam（Unity），角色程序，素材与设计文档全部由 AI 编写。架构规范文档已写好：others/gamejam/ai-native-gamejam-architecture-spec.md（RAA=Aesir Architecture 官方简称；决策=快捷档类结构 View 兼 Controller 单类 + 标准档 Model 暴露面只读+写方法；UI 用 RAM UIRoot 四层 Canvas，HUD/信息=Panel、模态/全屏=Window；通知查 ObservableValue/MiniEvent/EventModule 决策表；Jam 后升级触发器写在规范 §2.1）。该文档可直接拷贝到 Jam 仓库根目录当 AGENTS.md/CLAUDE.md 用。
- [2026-11-04 09:53:59] 用户 MacBook 内置 SSD（460Gi）长期接近占满（2026-11-04 实测已用 386Gi / 剩 50Gi），并挂载了外接盘 /Volumes/KESU（466Gi，可写）作为大文件归档落点；其 iCloud 本地占用仅 39MB，KESU 才是真正可用的转移目标。涉及「把 Unity 项目库 / 录屏素材 / 游戏库 / AI 会话历史挪出本机」的建议时，优先指向 /Volumes/KESU/... 而非 iCloud。Why: 用户希望这台机器变成偏工作用途的开发机，媒体与归档类大数据应外置。How to apply: 提迁移路径时用 /Volumes/KESU/{Media,Games,Archive,Projects} 之类目录，Unity 编辑器与在用项目则建议保留本地。
- [2026-11-04 09:54:30] Cowork / Codely CLI 的磁盘落点：会话历史主体在 ~/.codely-cli/tmp/<hash>/chats/*.jsonl（每个工作区一个 hash 目录，2026-11-04 实测合计 20.19G）；运行日志在 ~/.codely/logs/cowork-*.log（456M / 118 个）与 core-*.log；Web 缓存在 ~/Library/Caches/dev.codelycowork.desktop；应用本体 /Applications/Tuanjie Cowork.app + ~/Library/Application Support/Tuanjie Cowork/bin（内嵌 node + codely + lib）。~/.codely-cli/{CODELY.md,memory.md,skills,policies} 与 {settings,model-config,org,oauth_creds,mcp-oauth-tokens}.json 是配置/记忆/凭据，清理时勿删。Why: 排查 Cowork 空间占用或给清理建议时，避免误删工作成果与鉴权文件。How to apply: 会话 jsonl 属工作数据，建议按时间归档到 KESU 而非直接删除；日志与 Web 缓存可直接清。
- [2026-11-04 10:02:15] [2026-11-04] Cowork 会话数据模型（2026-11-04 实测）：①`~/.codely/sessions/<workspaceId>/sessions.sqlite` 只有 `session_metadata` 一张表（sessionId/title/dateCreated/dateUpdated/workspaceDirectory/messageCount/state/stateChangedAt/unread），`state` ∈ active|archived|pinned；②工作区哈希 = sha256(工作区绝对路径)，完整值用作 `~/.codely-cli/tmp/<hash>/`，前 16 位用作 `~/.codely/projects/<hash16>/`；③正文在 `tmp/<hash>/chats/<sessionId>.jsonl`（header+put/del 增量格式）；④`workspaceDirectory` 为空的历史会话要靠「哪个 hash 目录下有同名 jsonl」反推归属（本机 486 个这样归位，缺正文从 516 降到 22）。Why: 直接按 workspaceDirectory 建索引会丢掉大量历史会话并把正文全判成孤儿。
- [2026-11-04 10:02:19] [2026-11-04] Cowork 无会话「归档/删除」官方接口，已实测三处：`cowork --help`（只有 workspace/session/chat/page）、`codely --help`（Agent 运行时，无会话管理子命令）、本地 IPC `POST 127.0.0.1:31415/api/tauri/invoke`（缺私有 `messageType` 封装，非公开契约）。结论：归档只能靠直改 SQLite 的 `state` 字段，属非官方路径 → 按用户要求不做；删除只做文件级「移入系统废纸篓」。Why: 避免以后又去翻一遍二进制/接口，也避免误以为 CLI 漏了参数。
- [2026-11-04 16:48:04] [2026-11-04] Cowork 清理判定的实测纠正：孤儿 jsonl 不能一律当垃圾——`workspaceDirectory` 为空的「未绑定工作区」486 条里有 **422 条含真实人工提问**（1.70 GB），96,884 个子智能体会话抽样 400 个中 107 个也带父对话的真实提问；真正「只有上下文、无人提问」的只有 150 个无记录会话里的 149 个。Why: 仅凭「Cowork 侧栏看不到」就批量删会丢真实对话。How to apply: 删前先用首条人工提问判定（跳过 `This is the Codely CLI` 开头的上下文行），把 legacy `chat-*.json` + snapshot `chats/*.json` + 无提问会话作为第一档安全清理。**2026-11-04 补充修正**：工作台生成器 `apply_runtime` 把「chats/ 里未登记、且在 tasks/ 下有同名子目录」的文件标成 kind=`subagent`，这是**误标**——`tasks/<id>/` 的 `<id>` 是**父会话 id**（实测：tasks/1770f167 的 id 在 sessions.sqlite 有登记且 chats/ 下有同名文件），所以该标签实际含义是「未登记但自己开过子智能体的完整会话」（durableSessionId==自身、含会话上下文）。真正的子智能体正文在 `tasks/<父id>/task-<子id>.jsonl`（只有 task_meta + state_change 元数据流水）+ 同名 `.output`（产出正文，跑完即被应用自动清理），**不在 chats/ → 完全不进孤儿口径**，父会话 chats/ 里只留 Task 工具的 description/prompt 与最终结果。

- [2026-11-04 15:47:18] [2026-11-04] 站点新增 Unity 场景管理专题 `docs/unity-knowledge/scene-management/`：`scene-management-strategies.md`（Zensical 版，九节：三原语 / 六方案 A–F / 方案×规模矩阵 / 四档落地 / UI 放法 / SceneRoot 规范 / 十二坑 / 迁移路径 / 参考）+ 同名 `.html` 单文件交互版（暖色无蓝紫，自带 TOC 与 4 档 tab）；`zensical.toml` 的 Unity 分组下新增「Scene Management」nav。Why: 未来讨论 Unity 场景结构或要改这份文档时，直接定位即可，不用重新调研。How to apply: 该目录下的 `.html` 会被 Zensical 原样拷到 `site/`（不参与 Markdown 渲染、不受 broken-link 检查），所以 md 里引用它只能写 HTML 注释或相对文件路径；改 md 后必须 `zensical build --clean`。
- [2026-11-04 16:42:10] [2026-11-04] Cowork 工作台「未知路径」口径已拆分（生成器 cowork-workbench.py）：磁盘上无路径的 tmp 目录标为 type=residual「残留目录」（可清），sessions.sqlite 中 workspaceDirectory 为空的历史会话归入 type=unbound「未绑定会话」（真实历史，正文其实在已知路径工作区里，不可删）。totals 新增 residual_count / unbound_session_count。另：会话数变化优先查 ~/.codely/logs/cowork-YYYY-MM-DD.log 的 `history/delete` 行——那是应用侧界面删除会话的动作（2026-11-04 16:36 用户在界面连删 14 条，会话数 801→787，与磁盘清理无关）。
- [2026-11-08 01:21:48] 用户带一个 3~5 人 Unity 小团队，资产版本已用「腾讯 UGit」（ugit.qq.com，腾讯自研 Git 客户端，特性：工蜂锁可锁文件/目录/全分支、强制加锁工作流、LFS 缓存加速、检出子目录、快速提交、Excel diff、多仓管理），无需再上 Perforce；认为飞书「功能太多太杂」，找共享知识库要避开全家桶平台、优先 Git+Markdown+Zensical 这类分层方案。注：Perforce 已于 2025-03 将 Helix Core 更名为 P4。
- [2026-11-08 17:02:04] [2026-11-08] 站点新增 AI 笔记 `docs/ai/doc-to-deck-and-video-workflows.md`（文档→PPT/视频的免费工作流清单，含筛选口径、按场景结论表、PPT 线 7 节 + 视频线 8 节、试玩顺序、通用坑、来源日期）；`zensical.toml` 的 AI nav 按字典序插在 bento-presentation-guide 之后，`docs/ai/index.md` 已有条目同步。Why: 未来做演示页/讲解视频选型或改这份文档时直接定位，不用重新调研。How to apply: 改完后仍需 `zensical build --clean`；文档里额度类数字标了 2026-11-08 口径，复用前先复核。

### Reference
- [2026-11-04 16:32:19] [2026-11-04] Cowork 工作台技能与产物索引：技能 `~/.codely-cli/skills/cowork-workbench/SKILL.md`（已在 `codely skills list` 中显示为 user 级 enabled）；扫描器/生成器/本地服务单文件 `~/.codely-cli/cowork-workbench.py`；产物 `~/.codely-cli/cowork-workbench.html` 与 `cowork-workbench-data.json`（均在全局记忆目录根下）。命令：`python3 ~/.codely-cli/cowork-workbench.py`（默认扫描+起 8787 服务）、`--build` 只生成离线快照。不要在 `~/.agents/skills/` 放同名副本，否则会遮蔽旧版。配色：2026-11-04 起弃用 AI 蓝紫（#6ea8fe→#a78bfa），改为「暖墨 Walnut Ink / 暖纸 Warm Paper」earth-tone 体系——蜂蜜金 #e9c46a、陶土红 #e2694a、苔绿 #7cb98c、赭黄 #c9a227，与站点 extra.css 的 yuumix 暖色板同源；所有颜色集中在 HTML_TEMPLATE 的 `:root` / `[data-theme="light"]` 两块 CSS 变量里，改配色只改这两处；图表色读 `--c1..--c4`，切主题后须 renderAll 重绘。

