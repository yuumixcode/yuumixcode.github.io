---
name: frontend-slides
description: 创建零依赖、动画丰富的 HTML 演示文稿——从零开始或转换 PowerPoint 文件。当用户想制作演示文稿/slide/幻灯片、转换 PPT/PPTX 为网页、或为演讲/路演制作幻灯片时使用。通过视觉预览帮助非设计师发现自己的审美偏好，而非抽象选择。
---

# Frontend Slides

创建零依赖、动画丰富的 HTML 演示文稿，完全在浏览器中运行。

## 核心原则

1. **零依赖** — 单个 HTML 文件，内联 CSS/JS。不需要 npm、构建工具或框架。
2. **展示而非讲述** — 生成视觉预览，而非抽象选择。人们通过看来发现自己想要什么。
3. **独特设计** — 不要通用的"AI 风格"。每个演示文稿都应感觉是定制的。
4. **渐进式加载** — 先读轻量级样式索引。对 bold 模板，用小型预览卡展示样式预览，仅在用户选择后才加载完整 `design.md`。
5. **固定 16:9 舞台（不可妥协）** — 每个演示文稿使用 1920×1080 幻灯片画布，整体缩放到视口。幻灯片必须在所有屏幕上保持 16:9，包括手机。不要为适应设备而重新排列幻灯片内容。

## 设计美学

避免通用的"AI 风格"输出。专注于：

- **字体**：选择美观、独特、有趣的字体。避免 Arial、Inter 等通用字体。
- **颜色**：使用 CSS 变量保持一致性。主色调配尖锐点缀色优于平均分布的调色板。
- **动效**：优先 CSS-only 方案。用 `animation-delay` 实现错落出现的效果。
- **背景**：创建氛围和深度，而非默认纯色。叠加 CSS 渐变、几何图案或上下文效果。

**避免：**
- 通用字体（Inter、Roboto、Arial、系统字体）
- 老套配色（尤其是白底紫渐变）
- 可预测的布局和组件模式
- 缺乏上下文特色的千篇一律设计

## 固定舞台规则

适用于**每个**演示文稿中的**每张**幻灯片：

- 每个演示文稿有一个填满浏览器窗口的视口包裹器。
- 每张幻灯片在固定的 1920×1080 舞台中创作。
- 舞台均匀缩放以适应视口。可以信箱式/邮筒式留白；不得重新布局内容。
- 不要用响应式断点为手机重排幻灯片内容。
- 使用固定内部尺寸（1920×1080 设计尺寸）。
- 幻灯片可见性由 `.active` / `.visible` 通过 `visibility`、`opacity` 和 `pointer-events` 控制（见 [viewport-base.css](assets/viewport-base.css)）。不要用 `display: none` / `display: block` 切换幻灯片。
- `clamp()` 仅用于舞台外的非幻灯片 UI。
- 包含 `prefers-reduced-motion` 支持。
- 永远不要直接否定 CSS 函数（`-clamp()` 会被静默忽略）— 使用 `calc(-1 * clamp(...))`。

**生成时，读取 [viewport-base.css](assets/viewport-base.css) 并将其完整内容包含在每个演示文稿中。**

### 内容密度模式

询问用户这是主要用于阅读还是演讲的演示文稿：

| 密度模式 | 适用于 | 设计行为 |
|----------|--------|----------|
| **低密度 / 演讲为主** | 公开演讲、主题分享、现场讲解 | 每张幻灯片一个核心想法，大字体，强视觉层次，充足留白，最多 1-3 个要点 |
| **高密度 / 阅读为主** | 报告、讲义、异步审阅、详细内部文档 | 更自包含的幻灯片，结构化网格/表格/注释，4-8 个要点或 4-6 张卡片 |

---

## Phase 0: 检测模式

确定用户想要什么：

- **模式 A：新建演示文稿** — 从零创建。进入 Phase 1。
- **模式 B：PPT 转换** — 转换 .pptx 文件。进入 Phase 4。
- **模式 C：增强** — 改进现有 HTML 演示文稿。读取、理解、增强。遵循下方模式 C 修改规则。

### 模式 C：修改规则

增强现有演示文稿时，固定舞台适配是最大风险：

1. **添加内容前：** 计算现有元素数量，检查密度限制。
2. **添加图片：** 确保在 1920×1080 幻灯片画布内。如果幻灯片已满，拆分为两张。
3. **添加文本：** 每张幻灯片最多 4-6 个要点。超限则拆分为续页。
4. **任何修改后验证：** 幻灯片舞台保持 16:9，无文本溢出，无面板重叠。
5. **主动重组：** 如果修改会导致溢出，自动拆分内容并通知用户。

---

## Phase 1: 内容发现（新建演示文稿）

**一次性提出所有问题**，让用户一次填完：

**问题 1 — 用途**（header: "用途"）：
这个演示文稿用于什么？选项：Pitch deck / 教学-教程 / 会议演讲 / 内部演示

**问题 2 — 长度**（header: "长度"）：
大约多少张幻灯片？选项：短 5-10 / 中 10-20 / 长 20+

**问题 3 — 内容**（header: "内容"）：
内容准备好了吗？选项：全部内容就绪 / 粗略笔记 / 仅有主题

**问题 4 — 密度**（header: "密度"）：
幻灯片要多密？选项：
- "低密度 / 演讲为主" — 大想法，少文字，更多视觉呼吸空间
- "高密度 / 阅读为主" — 更自包含的细节，适合异步阅读

记住用户的密度选择。它影响幻灯片数量、字号比例、每张文字量、布局密度。

如果用户有内容，请他们分享。

### 步骤 1.2: 图片评估（如果提供了图片）

如果用户提供了图片文件夹：

1. **扫描** — 列出所有图片文件
2. **检查每张图片** — 用图片理解能力。如果不可用，用文件名/元数据
3. **评估** — 每张：显示什么、可用/不可用（含原因）、代表什么概念、主色调
4. **共同设计大纲** — 图片和文本一起决定幻灯片结构
5. **确认大纲**

如果有可用 logo，嵌入每个样式预览中（base64）— 用户看到他们的品牌以三种不同方式呈现。

---

## Phase 2: 样式发现

**这是"展示而非讲述"阶段。** 大多数人无法用语言表达设计偏好。

### 步骤 2.0: 直接生成 3 个样式预览

基于用途、受众、氛围和内容密度，生成 3 个不同的单页 HTML 预览，展示字体、颜色、动画和整体美学。

读取 [STYLE_PRESETS.md](references/STYLE_PRESETS.md) 了解安全预设候选。如果 [bold-template-pack/selection-index.json](bold-template-pack/selection-index.json) 存在，也读取该紧凑索引，但**不要**读取任何 `design.md` 文件。

| 氛围 | 建议预设 |
|------|----------|
| 印象深刻/自信 | Bold Signal, Electric Studio, Dark Botanical |
| 兴奋/充满活力 | Creative Voltage, Neon Cyber, Split Pastel |
| 平静/专注 | Notebook Tabs, Paper & Ink, Swiss Modern |
| 受启发/感动 | Dark Botanical, Vintage Editorial, Pastel Geometry |

**预览组合规则：**
- 默认生成 3 个预览：1 个安全预设（来自 STYLE_PRESETS.md）、至少 1 个 bold 模板（来自 selection-index.json）、1 个通配符。
- 通配符可以是第二个 bold 模板或自定义设计。
- 不要强制每个表现型选项都来自模板库。如果需求有更具体的设计机会，用通配符自由设计。

**预览真实性规则（不可妥协）：**
- 每个样式预览必须看起来像用户演示文稿的真实首页，不是诊断卡。
- 永远不要在幻灯片上渲染内部工作流文本：没有 `preview`、`generated from`、`template`、`preset`、`Option A/B/C`、文件名、路径等。
- 如果幻灯片需要装饰元素，只使用真实的演示文稿装饰：标题、章节名、日期、作者、页码或用户材料的实际内容短语。

将预览保存到 `.frontend-slides/slide-previews/`（style-a.html, style-b.html, style-c.html）。每个应自包含且紧凑，展示一个带动画的标题页。

自动为用户打开每个预览。

### 步骤 2.1: 用户选择

询问（header: "样式"）：
你更喜欢哪个样式预览？选项：样式 A: [名称] / 样式 B: [名称] / 样式 C: [名称] / 混合元素

---

## Phase 3: 生成演示文稿

使用 Phase 1 的内容和 Phase 2 的样式生成完整演示文稿。

如果用户选择了 bold 模板，在生成前读取该模板的完整 `design.md`。不要读取其他 bold 模板。将 `design.md` 视为设计配方：保留其字体、调色板、装饰词汇、间距节奏和组件语法。

**生成前，读取这些支持文件：**
- [html-template.md](references/html-template.md) — HTML 架构和 JS 功能
- [assets/viewport-base.css](assets/viewport-base.css) — 必须包含的 CSS（完整包含）
- [animation-patterns.md](references/animation-patterns.md) — 动画参考

**关键要求：**
- 单个自包含 HTML 文件，所有 CSS/JS 内联
- 在 `<style>` 块中包含 viewport-base.css 的完整内容
- 使用 Fontshare 或 Google Fonts 字体 — 永远不用系统字体
- 添加详细注释解释每个部分
- 每个部分需要清晰的 `/* === SECTION NAME === */` 注释块

---

## Phase 4: PPT 转换

转换 PowerPoint 文件时：

1. **提取内容** — 运行 `python scripts/extract-pptx.py <input.pptx> <output_dir>`（如需安装：`pip install python-pptx`）
2. **与用户确认** — 展示提取的幻灯片标题、内容摘要和图片数量
3. **样式选择** — 进入 Phase 2 进行样式发现
4. **生成 HTML** — 转换为所选样式，保留所有文本、图片（从 assets/）、幻灯片顺序和演讲者备注（作为 HTML 注释）

---

## Phase 5: 交付

1. **清理** — 删除 `.frontend-slides/slide-previews/`（如果存在）
2. **打开** — 用 `open [filename].html` 在浏览器中启动
3. **总结** — 告诉用户：
   - 文件位置、样式名称、幻灯片数量
   - 导航方式：方向键、空格、滑动/点击（如启用）
   - 自定义方法：`:root` CSS 变量改颜色，字体链接改字体，`.reveal` 类控制动画
   - 内联文本编辑可用：悬停左上角或按 E 进入编辑模式，点击文本编辑，Ctrl+S 保存
   - 提供后续操作：修改、直接在浏览器编辑文本、或导出/分享

---

## Phase 6: 分享与导出（可选）

交付后，**询问用户：** _"想分享这个演示文稿吗？我可以部署到在线 URL（在任何设备上可用）或导出为 PDF。"_

选项：
- **部署到 URL** — 可在任何设备上访问的链接
- **导出为 PDF** — 通用文件，适合邮件、Slack、打印
- **两者都要**
- **不用了**

### 6A: 部署到在线 URL（Vercel）

1. 检查 Vercel CLI 是否安装：`npx vercel --version`
2. 检查是否登录：`npx vercel whoami`。未登录则引导用户注册并 `vercel login`
3. 部署：`bash scripts/deploy.sh <path-to-presentation>`
4. 告知用户在线 URL，可在任何设备上访问

### 6B: 导出为 PDF

1. 运行：`bash scripts/export-pdf.sh <path-to-html> [output.pdf]`
2. 脚本用 Playwright 无头浏览器逐张截取 1920×1080 截图，合并为 PDF
3. 首次运行会安装 Playwright 和 Chromium（约 150MB），可能需要 30-60 秒
4. 如需压缩文件大小，加 `--compact` 标志（1280×720 渲染，减小 50-70%）

---

## 支持文件索引

| 文件 | 用途 | 读取时机 |
|------|------|----------|
| [references/STYLE_PRESETS.md](references/STYLE_PRESETS.md) | 12 个精选视觉预设（颜色、字体、签名元素） | Phase 2（样式选择） |
| [bold-template-pack/selection-index.json](bold-template-pack/selection-index.json) | Bold 模板紧凑元数据（34 个模板） | Phase 2（样式选择） |
| [references/html-template.md](references/html-template.md) | HTML 结构、JS 功能、代码质量标准 | Phase 3（生成） |
| [assets/viewport-base.css](assets/viewport-base.css) | 必须包含的固定舞台 CSS | Phase 3（生成） |
| [references/animation-patterns.md](references/animation-patterns.md) | CSS/JS 动画片段和效果-感受指南 | Phase 3（生成） |
| [scripts/extract-pptx.py](scripts/extract-pptx.py) | PPT 内容提取脚本 | Phase 4（转换） |
| [scripts/deploy.sh](scripts/deploy.sh) | 部署到 Vercel | Phase 6（分享） |
| [scripts/export-pdf.sh](scripts/export-pdf.sh) | 导出为 PDF | Phase 6（分享） |
