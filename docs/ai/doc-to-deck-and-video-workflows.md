# 文档 → PPT / 视频：免费工作流清单

> 目标：手里已经有一篇写好的文档（Markdown / Word / PDF），想**不花钱**把它变成能讲的演示页，或者一段讲解视频。
> 更新日期：2026-11-08（下面的额度都是这一天核实的官网口径，各家改得快，动手前先看一眼定价页）

## 0. 筛选口径

「免费」在这篇文章里只认三种：

| 类型 | 含义 | 是否收录 |
| --- | --- | --- |
| 开源自托管 | MIT / Apache-2.0，跑在自己机器上，永久免费 | ✅ 首选 |
| 长期免费额度 | 白嫖额度会重置（每天/每月）或一次性足够用，无水印或水印可接受 | ✅ 收录但要标限制 |
| 限时试用 | 14 天试用、送一次体验点数、导出要付费 | ❌ 只写进「避坑」 |

**一个反复踩的坑**：能免费「生成」不等于能免费「拿走」。很多工具免费出稿，但导出 PPTX / 去水印才要钱。所以下面每个方案都单独标了**导出与编辑能力**。

## 1. 先看结论：按场景选

| 你的情况 | 走这条 | 成本 |
| --- | --- | --- |
| 文档已是 Markdown，要**可编辑的 PPTX** | **Presenton**（桌面版或 Docker 自托管） | $0（自备 LLM key，可用 Ollama） |
| 中文文档、今天就要交、不想装东西 | **豆包** | $0（无水印、可编辑） |
| 不想装东西，就想 5 分钟出一版能讲的稿 | **Gamma** 免费版 | $0，400 一次性积分 |
| 技术分享，要好看、能版本管理、能放代码和公式 | **Slidev** | $0（MIT） |
| 要交给别人改、必须原生 PPTX | **WPS AI** 或 **Presenton** | 免费额度有限 / $0 |
| 只要一个能双击打开、离线的单文件 deck | 本站已有的 [bento 方案](bento-presentation-guide.md) | $0 |
| 文档 → 带旁白的讲解视频，越快越好 | **Gemini Notebook 视频概览**（原 NotebookLM） | $0，3 条/天 |
| 有现成 PPT，要「我的版式 + 我的配音」 | **Canva 录制** 或 **OBS + Edge TTS** | $0 |
| 中文口播短视频、要能改字幕改配音 | **剪映「图文成片」** | $0（Pro 素材/AI 功能要会员） |
| 想让 agent 全自动制片 | **OpenMontage**（AGPL-3.0） | $0 + agent token |
| 要批量、要完全可控、不想被平台限额 | **MoneyPrinterTurbo** | $0（MIT，无 GPU 可跑） |

---

## 2. 文档 → PPT

### 2.1 Presenton（开源，首选）

- 仓库：<https://github.com/presenton/presenton> ｜ 官网：<https://presenton.ai>
- **两种用法**：**桌面 App**（Win / macOS / Linux，装完即用）或 **Docker 自托管**（一条命令）。
- **定位**：开源的 AI 演示生成器，Gamma / Canva 的自托管替代。
- **输入**：提示词、**上传文档（PDF / DOCX / PPTX）**、或你自己的 PPTX 模板（会学版式/字体/配色）。**输出**：完全可编辑的 PPTX + PDF。
- **免费边界**：Apache-2.0。官方下载页原文写明桌面版「**no hidden fees, subscriptions, or usage limits**」——不限量、无水印。
- **唯一成本**：LLM。支持 Ollama、LM Studio、OpenAI、Gemini、Azure、Bedrock、Anthropic 等任何 OpenAI 兼容接口——**用 Ollama 跑本地模型就是真零成本**。
- **坑**：
  - 内置模板是英文商务风（Momentum / Dynamic / Executive / Modern / Standard），**中文断行和字重必须自己验**；想好看就得传一套自己的 PPTX 当模板，否则「模板感」很重。
  - `slides_markdown` 模式不是确定性渲染，仍会过一遍 LLM 改写，默认每条大纲 100 词（`MAX_OUTLINE_WORDS` 可调）。
  - 项目还在 0.9.x beta，环境变量和配置项变动频繁。
- **上手成本**：桌面版 2~5 分钟；Docker 5~15 分钟。

### 2.2 Gamma（零代码，出稿最快）

- 官网：<https://gamma.app> ｜ 导入说明：<https://help.gamma.app/en/articles/11047840-how-can-i-import-slides-or-content-into-gamma>
- **免费边界**（官方定价页）：**400 starter credits，一次性，不补充**（可邀请好友换）；可从 **PPTX / DOCX / PDF** 导入；可导出 **PDF / PPTX / PNG / Google Slides**；不需要信用卡。
- **两个常被当成官网口径的数字**：单次生成上限 **10 页**、导出带 **「Made with Gamma」角标**——官网只写了「去品牌标识是 Plus $9/月起的权益」，10 页这个数字来自多篇 2026 实测（口径一致但非官方原文）。
- **坑**：① 单条消息上限 250MB，**PDF/PPTX 超 100MB 可能上传成功却导入失败**；② 导出后图表和图标变图片，图层被扁平化；③ 它会**改写你的文字**，精确数据会被近似处理。
- **适合**：内部评审、快速给人看方向。**不适合**：需要逐字保真的法律/财务/技术参数稿。
- **上手成本**：3~5 分钟。

### 2.3 国产零代码快查（豆包 / Kimi / WPS / 讯飞智文）

国内这几家更新极快，额度也最不透明，所以只写「确定的部分 + 明确的未知」：

| 工具 | 免费实况 | 导出与可编辑性 | 主要坑 |
| --- | --- | --- | --- |
| **豆包** | 官方写新用户「30 天免费体验套餐」；实测口径为**免费、无水印、可上传材料** | PPTX + PDF，可在线逐元素改、可生成演讲稿 | 精确数据会被四舍五入；**同一对话里生成的多份 PPT 会合并，无法单独下载**；模板偏「汇报体」 |
| **Kimi PPT** | 官方 FAQ 称有免费额度，但**未公开具体次数**；会员 ¥49/月起 | PPTX / PNG，能画信息图、地铁图、靶环图 | **所有会员功能共用一个 token 池**（PPT 和 Deep Research 抢额度）；长文会被明显简化改写 |
| **WPS AI** | 生成 PPT 属内置能力可免费用，但**有次数限制**；AI 权益在「大会员」，超级会员不含 | **原生 .pptx，不转换、字体版式不跑**（兼容性最好） | 设计审美落后于豆包/Kimi；套娃收费争议一直在 |
| **讯飞智文** | 首页写「免费使用」，**次数/页数未公示** | .pptx + .docx，带演讲备注 | 长文上限 8000 字，压缩强；模板化痕迹重 |
| **Canva** | 免费档**每月 20 次 AI 调用**（共享池） | PPTX / PDF / PNG / MP4 | **Docs→Decks（文档一键转演示）已下线**，这条路在 Canva 已经断了 |

- **一句话**：中文文档、今天就要交、不想花钱 → **先试豆包**（免费无水印这一条目前最实在），不满意再拿 Kimi 重做视觉，要交给别人改就用 WPS 或 Presenton。

### 2.4 Slidev（技术内容的最佳上限）

- 官网：<https://sli.dev>（MIT，v53）
- **定位**：给开发者的 Markdown 演示框架，Vue 驱动，代码高亮、公式、Mermaid、组件原生支持。
- **对 agent 友好（2026 新增）**：内置 **MCP Server** + 官方 skill（`npx skills add slidevjs/slidev`），可以直接让 Claude Code / Codex 读写、重排、翻页。
- **导出**（需先 `npm i -D playwright-chromium`）：

  ```bash
  slidev export                          # PDF
  slidev export --format pptx            # PPTX，整页转图片
  slidev export --format pptx-editable   # 原生形状，文字可选中可编辑
  slidev export --format png             # 每页一张图
  ```

- **关键取舍**：`pptx` 视觉最忠实但文字变图片；`pptx-editable` 文字可改，但 **SVG（含 Mermaid/图标）、canvas、iframe、视频、KaTeX 公式、CSS 渐变/filter/clip-path 仍是图片**，单页重建失败会整页回退成图。
- **坑**：PPTX 只记字体名不嵌字体，对方没装就替换；中文要自己配字体（思源黑体）写进 theme；导出后所有交互失效，想保留交互就发布成网页。
- **录制视频**：Slidev **没有视频导出格式**，走 3.2 的录屏或出图 + ffmpeg。
- **上手成本**：10~20 分钟（含 Playwright 安装）。

### 2.5 Marp（最轻，但 PPTX 基本不可编辑）

- 官网：<https://marp.app> ｜ CLI：<https://github.com/marp-team/marp-cli>（MIT）
- Markdown 写、`---` 分页，导出 HTML / PDF / PPTX / PNG；`npx @marp-team/marp-cli@latest deck.md --pptx`。
- **必须知道的限制**：默认 `--pptx` **每页是预渲染背景图**，README 原话「contents cannot to modify or re-use」；要可编辑得加 `--pptx-editable`，但官方自己标 **EXPERIMENTAL**——需另装 **LibreOffice Impress**，复杂主题会报错或出残缺结果，**且不支持演讲备注**。
- **结论**：要「Markdown + 可编辑 PPTX」请选 Slidev，不要指望 Marp。Marp 适合「只读交付」（PDF/HTML）。

### 2.6 本站已有、别重复造轮子

- **[bento 单文件 deck](bento-presentation-guide.md)**：产物是 `.bento.html`，双击即演示、自带编辑器、可离线、可 iframe 嵌进本站，完全免费且不依赖任何服务。
- **frontend-slides**（本仓库 `.codely-cli/skills/frontend-slides/`，上游 <https://github.com/zarazhangrui/frontend-slides>，MIT）：零依赖 HTML 幻灯片，视觉上限最高、可交互可部署；**没有 PPTX 导出**，「可编辑」= 改代码。

### 2.7 避坑：这些别再试了

| 工具 | 坑 |
| --- | --- |
| **Tome Slides** | 2025-04-30 已停止服务，旧教程全在教一个不存在的产品 |
| **Beautiful.ai** | 只有限时试用，不是长期免费 |
| **墨刀 AIPPT / PPTGO / Decktopus** | 「免费注册」≠ 免费导出，导出可编辑源文件普遍在付费权益里（PPTGO 免费单次最多 25 页） |
| **Canva「文档转演示」** | Docs→Decks 功能官方已下线，别再照着旧教程找入口 |

---

## 3. 文档 → 视频

### 3.1 Gemini Notebook 视频概览（原 NotebookLM）——唯一「整篇文档进、成片出」还免费的

- 入口：<https://notebook.google.com>（2026 年 7 月起 NotebookLM 更名 Gemini Notebook，旧笔记本照常可用）
- **管线**：来源 → Gemini 写分镜与解说词 → Gemini 配音 → Gemini 自绘画面 → 下载 MP4。你不写脚本、不配音、不找画面。
- **输入格式**（官方明列，不用转换）：PDF、**docx、txt、md**、csv、**pptx**、ePub、图片、网页 URL、YouTube（需公开带字幕）、本地音频（自动转写）、直接粘贴文本。
- **三种成片**：
  - **Explainer**：横屏、结构化，**支持 80+ 语言，含简体中文**——要中文就走这个
  - **Short**：约 60 秒竖屏，语言支持官方未明确，需实测
  - **Cinematic**：1~3 分钟沉浸式（Gemini 3 + Veo 3），**官方明确仅英文、18+、免费档没有**
- **免费边界**（两个口径都记下来，别只信一个）：
  - 官方帮助页额度表：免费（Standard）档 **视频概览 3 条/天**、音频概览 3/天、100 个笔记本、每本 50 个来源、单来源上限 50 万词或 200MB
  - 另有报道称 **2026-09-02 起消费级套餐改成「算力制」**（每 5 小时刷新、有周上限、不再公布固定次数）→ 以你账号里实际显示的余量为准
  - 水印：Pro 及以上才去掉，部分地区免费档成品带可见水印
- **它强在哪**：画面是从你原文里**抽图、抽引文、抽数字**再重绘，不是随机贴素材库，所以解说和画面对得上。
- **坑**（都是硬坑）：
  1. **上传 PPT 不会保留你的版式**。它把 PPT 当纯文本读，再按自己的画风重画一遍，模板配色全丢。要「我的版式 + 配音」请走 3.2。
  2. **一次成型、不可改**。没有分镜编辑，官方唯一补救是生成前的 **Review producer notes**——先审它写的制作笔记，一次把意见提完再 Proceed，之后改不了。**这一步务必打开**。
  3. **慢**：官方自认「有时超过 30 分钟」，实测 15~45 分钟，偶发失败或刚生成完下载 404（等一两分钟重试）。
  4. 免费 3 条/天 = 一天只有 3 次试错。
- **上手成本**：10~15 分钟操作 + 15~45 分钟等待，零安装零 key。

### 3.2 幻灯片 → 视频（最稳，因为不赌 AI 理解）

画面就是你自己做的，AI 只负责配音和剪辑，出错概率最低。四条路按「要不要花钱」排：

| 做法 | 管线 | 成本 | 关键点 |
| --- | --- | --- | --- |
| **Canva「Present and record」** | 导入 PPT/用模板 → 录屏+录音 → 导出 MP4 | 免费档可用（用了 Pro 素材才带水印） | **录错可按页重录**，自带字幕；仅电脑端 |
| **OBS + Edge TTS** | 文档 → 逐页讲稿 → `edge-tts` 生成中文配音 → OBS 录幻灯片放映 | $0（OBS 是 GPL，Edge TTS 免费无 key） | 唯一能同时拿到「你的版式 + 自然中文 + 精确时长」；首次要写点胶水代码 |
| **PowerPoint 录制并导出** | 每页写讲稿 → 录制幻灯片放映 → 导出 MP4 | 桌面版 PowerPoint 付费，**网页版不能导 MP4** | 画质与音画同步最好；录音错了只能整页重录 |
| **Slidev 出图 + ffmpeg** | `slidev export --format png` → ffmpeg 拼帧 + 音轨 | Slidev MIT 免费 | 注意 **Slidev 没有视频导出格式**，这是拼出来的 |

- **为什么值得**：完全免费、无水印、时长随意、可反复改。第一次要花 1~2 小时搭好，之后每篇文档的边际成本约 20 分钟。
- **关键设置**：1920×1080 / 30fps，幻灯片字号 ≥ 24pt，否则压缩后糊。

### 3.3 剪映「图文成片」（中文配音最自然的一档）

- 官网：<https://www.jianying.com>
- **管线**：粘贴文案 → 选音色 → 自动断句/配音/配图/字幕 → 进时间线精修 → 导出。
- **免费边界**：**生成免费**；用自己的素材可以**无水印导出**；但只要用了带「钻石/SVIP」标记的模板、字体、花字、AI 功能（数字人、音色克隆等），点导出就会弹付费。
- **效果**：中文 TTS 自然度国内第一梯队；但配图是**按关键词搜素材**，抽象概念必然配错，实际交付几乎一定要人工换图。
- **上手成本**：装 10 分钟 + 每条 15~30 分钟改图。

### 3.4 Google Vids（免费额度真实但很小）

- 入口：<https://vids.google.com>（仅桌面端创建）
- **关键前提**：它的输入是 **Slides 或提示词，不是 Doc**。想把文档转视频，得先人工把正文拆成 Slides（正文进标题/要点，讲稿进 speaker notes），再 `Slides → Vids`。这一步往往把「自动」省下的时间又还回去。
- **免费额度**（个人账号官方额度表）：**每月 50 credits**，每月 1 日重置不累积；**Slides→Vids 每次 5 credits ≈ 10 条/月**；AI 虚拟形象 6 个/月；AI 视频片段仅 60 秒/月。
- 单条视频上限 30 分钟；每页时长自动对齐配音，无配音默认 5 秒/页。
- **坑**：AI 播报和很多 AI 功能偏英文；虚拟形象不对口型；>45 页要关掉 AI 配音那套。
- **上手成本**：30~60 分钟（拆页最费时）。

### 3.5 MoneyPrinterTurbo（开源，无 GPU 可跑）

- 仓库：<https://github.com/harry0703/MoneyPrinterTurbo>（MIT）
- **管线**：主题或**自定义脚本** → LLM 写/改脚本 → Edge TTS 配音 → 库存素材匹配 → 自动字幕 → 合成 1080p。
- **免费边界**：代码全免费；**贴自己的文档当脚本、只留 Edge TTS，可以做到 0 API key**（官方支持自定义脚本）；字幕用 `edge` 模式靠 TTS 时间戳生成，不需要 GPU。
- **硬件**：官方原文「GPU 不是必需项」，4 核 4G 起。
- **坑**：画面是**通用库存空镜**，和文档只有关键词级相关——「画面与内容不匹配」是结构性问题，不是 bug。适合口播 + 泛画面，不适合技术讲解。
- **上手成本**：装 30~60 分钟（Python 3.11+/uv/ffmpeg），之后 5~10 分钟/条。

### 3.6 OpenMontage（开源，零 API key 的 agent 制片厂）

- 仓库：<https://github.com/OpenMontageInc/OpenMontage>（**AGPL-3.0**，注意不是 MIT）
- **定位**：把 Claude Code / Codex 这类编码 agent 当导演，12 条管线里有 **Animated Explainer**（动画讲解），最贴近「文档 → 讲解视频」。
- **零 key 路线**：Piper TTS（离线免费旁白）+ Archive.org / Wikimedia Commons 免费影像 + FFmpeg；Pexels/Pixabay 的 key 也免费申请。
- **坑**：① **AGPL-3.0**，商业分发/托管要开源，自己用没问题；② 真正烧的是**你 agent 的 token**，不在这项目账单里；③ 中文 Piper 音色一般，要中文最好接 Edge TTS；④ 项目很新，接口会变。
- **上手成本**：装 60~120 分钟，之后每条要跟 agent 来回几轮。

### 3.7 数字人口播（免费额度都很紧，先看数字）

| 工具 | 免费档实况 | 结论 |
| --- | --- | --- |
| **HeyGen** | **3 条/月、每条 ≤1 分钟、720p、强制水印**，永久免费非试用 | 一篇 3000 字文档要切 8~10 条，只有 3 条额度 → **做不完**，只够 demo |
| **百度度加** | 官方 App 描述称「AI 数字人……完全免费使用」，但**未公示次数与导出规格** | 国内唯一敢写完全免费的，要登录后实测才知道边界 |
| **D-ID** | 仅 **14 天试用**、共 3 分钟、全屏水印 | 不算免费额度 |
| **即梦** | 每日送积分，但「数字人」是 **¥199 起标准会员**权益 | 免费额度做不了口播 |

真要口播且预算为 0：走 3.2 的方案录自己，或用本机 TTS（见[语音克隆 TTS 方案指南](voice-clone-tts-guide.md)）+ 剪映。

### 3.8 避坑：已经停服 / 只有试用的视频工具

| 工具 | 现状 |
| --- | --- |
| **腾讯智影** | 2025-04-26 公告「6 月 30 日起暂停服务并删除用户数据」，2025-09 公众号注销，官网只剩「升级维护中」。**网上的智影教程全是 2023–2024 存量** |
| **阿里云虚拟数字人** | 2026-10 公告整条产品线下线（形象定制 / 积分会员 / 直播商品） |
| **D-ID** | 仅 14 天试用、共 3 分钟、全屏水印；去水印要到 $108/月的档位 |
| **即梦「数字人」** | 免费额度只能做文生图/文生视频，「数字人」是 ¥199 起标准会员权益 |

> 选型前先确认「官网今天还能打开」——2025 年国内 AI 应用倒了 25 款，教程的保鲜期普遍短于工具的寿命。

---

## 4. 建议的试玩顺序（一晚上能筛完）

| 顺序 | 做什么 | 判断标准 | 时间 |
| --- | --- | --- | --- |
| 1 | 豆包上传同一篇文档 | 够不够「今天就能交」 | 3 min |
| 2 | Gamma 上传同一篇文档 | 30 秒内能不能看出「这版能直接用」 | 5 min |
| 3 | Presenton 桌面版跑一次 | 导出的 PPTX 能不能直接改字、中文断行是否正常 | 5~15 min |
| 4 | 装 Slidev，把 Markdown 粘成 slides.md | 中文排版和代码块是否满意 | 20 min |
| 5 | Gemini Notebook 上传 PDF 出视频概览（**先审 producer notes**） | 旁白是否像人、画面是否贴原文 | 10 min（+ 排队 15~45 min） |
| 6 | 剪映图文成片，同一篇文档 | 配音断句、字幕准确率 | 15 min |

**一次只换一个变量**：同一篇文档、同一个 prompt，横向比。不然你分不清是工具不行还是稿子不行。

---

## 5. 共同的坑（每个方案都会遇到）

1. **AI 会改你的数字**。Gamma、豆包、WPS AI 都会对精确数据做「近似改写」。技术文档要么用 Presenton + 强模型并明确要求「不得改动数字」，要么走 Slidev/Marp 自己排。
2. **导出 PPTX 后一切皆图**。除了 `pptx-editable` 这类专门模式，多数方案导出的 PPTX 是整页截图，改一个字都要回原工具。
3. **字体不跟着走**。PPTX 只记字体名。中文标题用了霞鹜文楷这类字体的，对方电脑上没有就全变宋体。
4. **水印位置和商用授权是两件事**。去掉水印不代表素材可商用，剪映/Gamma 的内置图片库要单独看授权。
5. **视频的瓶颈从来不是生成，是审核**。免费额度下你只有 3~10 次机会，稿子没打磨好就去生成，额度很快就烧完。

---

## 6. 参考与核实记录

- Presenton 仓库（Apache-2.0、Docker/桌面版不限量、Ollama、可编辑 PPTX）：<https://github.com/presenton/presenton>
- Gamma 定价页（400 一次性积分、可导入 PPTX/DOCX/PDF、去品牌属付费）：<https://gamma.app/pricing>
- Gamma 导入限制（250MB 上限、超 100MB 的 PDF/PPTX 可能导入失败）：<https://help.gamma.app/en/articles/11047840-how-can-i-import-slides-or-content-into-gamma>
- Slidev 导出文档（PDF / pptx / pptx-editable / png，需 playwright-chromium）：<https://sli.dev/guide/exporting>
- Slidev 与 AI 协作（内置 MCP Server 与官方 skill）：<https://sli.dev/guide/work-with-ai>
- Marp CLI（默认 `--pptx` 为图片、`--pptx-editable` 需 LibreOffice 且为实验性）：<https://github.com/marp-team/marp-cli>
- Canva AI 额度（免费档每月 20 次）与 Docs→Decks 下线：<https://www.canva.com/help/ai-access>
- 豆包（PPT 生成入口、可上传材料）：<https://www.doubao.com>
- Kimi PPT（官方用户指南，2026-11 更新）：<https://www.kimi.com/academy/slides-intro>
- WPS AI（生成 PPT 的内置能力与次数限制说明）：<https://plus.wps.cn/blog/p106786.html>
- 讯飞智文（长文本 8000 字上限，输出 pptx/docx）：<https://zhiwen.xfyun.cn>
- Gemini Notebook 视频概览帮助页（语言、风格、Ultra 专属项）：<https://support.google.com/gemininotebook/answer/16454555?hl=zh-Hans>
- Gemini Notebook 额度表（免费档 3 条/天、50 来源、50 万词/来源）：<https://support.google.com/notebooklm/answer/16213268>
- Gemini Notebook 支持的来源格式（含 md / docx / pptx）：<https://support.google.com/gemininotebook/answer/16215270>
- Google Vids 产品页（免费试用、付费扩额度、单条 30 分钟上限）：<https://workspace.google.com/products/vids>
- Google Vids 额度表（个人账号 50 credits/月，Slides→Vids 5 credits/次）：<https://support.google.com/docs/answer/15609411?hl=en>
- Canva 录制演示（Present and record）：<https://www.canva.com/help/talking-presentations>
- PowerPoint 演示文稿导出为视频（1920×1080 / MP4）：<https://support.microsoft.com/en-us/office/turn-your-presentation-into-a-video-c140551f-cb37-4818-b5d4-3e30815c3e83>
- HeyGen 定价（免费档 3 条/月、1 分钟/条、720p 水印）：<https://www.heygen.com/pricing>
- OpenMontage（AGPL-3.0，零 API key 用 Piper TTS + 免费影像）：<https://github.com/OpenMontageInc/OpenMontage>
- MoneyPrinterTurbo（MIT，4C4G 无 GPU，Edge TTS 免费）：<https://github.com/harry0703/MoneyPrinterTurbo>
- 剪映官网（图文成片、文本朗读、数字人 VIP 边界）：<https://www.jianying.com>

> 额度类数字均以 2026-11-08 的官网/官方定价页为准。这类产品平均每季度调一次，尤其是「免费额度改为算力制」这类变化，实际试之前请再确认一次。
