# Zensical 自定义字体指南

> 怎么在 Zensical 里换中文字体、英文字体、代码字体。

本文以本站配置（中文 **霞鹜文楷** + 英文 **Inter** + 代码 **JetBrains Mono**）为例，给出从思路到落地的完整流程。

**核心结论（先看这里）**：

Zensical 主题的 CSS 变量（`--md-text-font` 等）**覆盖不生效**——主题在 `<head>` 里 inline 注入的变量名（无 `-family` 后缀）跟 `main.min.css` 实际消费的变量名（带 `-family` 后缀）**不是同一个**。所以不要用 CSS 变量覆盖，**直接给 `body` / `h*` / `code` 写 `font-family`**（参考 [Wcowin 教程](https://wcowin.work/Zensical-Chinese-Tutorial/blog/advanced/custom-fonts/)）。

---

## 1. 推荐字体

### 中文

| 字体 | 风格 | 推荐场景 | 协议 |
| --- | --- | --- | --- |
| **霞鹜文楷 / LXGW WenKai** | 楷体，文艺感 | 个人站、博客、文档 | SIL OFL 1.1 |
| 思源黑体 / Noto Sans SC | 黑体，正式感 | 商业站、官方文档 | SIL OFL 1.1 |
| 思源宋体 / Noto Serif SC | 宋体，传统 | 学术、长文阅读 | SIL OFL 1.1 |
| 得意黑 / Smiley Sans | 标题黑体 | 标题、Logo | SIL OFL 1.1 |
| 汇文明朝体 / Huiwen-mincho | 明朝体 | 文艺 / 复古风格 | OFL |

霞鹜文楷分几个版本：

- **完整版**：字形最全，文件大（几 MB）
- **Lite 版**：剔除罕用字，适合内嵌
- **Screen 版**：屏幕阅读优化，body 文本友好（**本站选这个**）
- **TC 繁体版**：旧字形 + 繁体

### 英文

| 字体 | 风格 | 搭配 |
| --- | --- | --- |
| **Inter** | 无衬线，现代 | 霞鹜文楷 / 思源黑体（**本站选这个**） |
| Ysabeau | 无衬线，霞鹜官方推荐 | 霞鹜文楷 |
| Roboto | 无衬线，Zensical 主题默认 | 通用 |
| system-ui | 系统原生 | 不想引入字体时 |

### 代码

| 字体 | 特点 |
| --- | --- |
| **JetBrains Mono** | 等宽、支持 ligature（`=>` `!=` `>=` 这种连字），**本站选这个** |
| Roboto Mono | Zensical 主题默认 |
| Fira Code | 老牌 ligature 字体 |
| LXGW Bright Code | 霞鹜文楷 + Monaspace 合并版 |
| SF Mono / Consolas | 系统原生 |

---

## 2. 中英文混排的核心思路

`font-family` 是个**有序列表**，浏览器对**每个字符**单独选字体——找到一个能渲染的就停。

**两种策略**：

### 策略 A：英文优先（本站用）

```css
font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, ...,
  "LXGW WenKai Screen", "LXGW WenKai", "霞鹜文楷", sans-serif;
```

- ASCII 字符 → 命中 Inter（或其他英文优先字体）
- CJK 字符 → 跳过 Inter（没中文字形）→ 命中 LXGW WenKai Screen

效果：**英文用 Inter 的现代无衬线，中文用霞鹜文楷的楷体**。混排协调，英文更专业。

### 策略 B：中文字体优先（Wcowin 教程用）

```css
font-family: "LXGW WenKai", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

- 任何字符 → 先试 LXGW WenKai（有基本拉丁字符 + CJK）
- LXGW 没字形 → 命中 -apple-system / Segoe UI 等

效果：**英文也用霞鹜文楷的"楷体英文"**，统一感更强但英文不如 Inter 精致。

> **本站用策略 A**——英文 Inter 更专业，配霞鹜文楷的"书卷气"更协调。

---

## 3. 三种接入方式

### 方案 A：CDN `@import`（本站采用，最简单）

适合静态站、初次搭建，**一行代码搞定**。

```css
/* docs/stylesheets/extra.css 顶部 */
@import url("https://cdn.bootcdn.net/ajax/libs/lxgw-wenkai-screen-webfont/1.7.0/style.min.css");
@import url("https://fonts.font.im/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap");
```

> 第一个是霞鹜文楷 Screen（bootcdn，国内稳定）。
> 第二个是 Inter + JetBrains Mono（**font.im** = Google Fonts 国内反代，gstatic 资源也走 `fonts.gstatic.font.im`）。
>
> **本站默认国内访客**，所以英文字体也走国内反代。如果以后访客变回海外，把 `fonts.font.im` / `fonts.gstatic.font.im` 换回 `fonts.googleapis.com` / `fonts.gstatic.com` 即可，其他都不动。
>
> font.im API 跟 Google Fonts 100% 兼容——换 URL 就行。**目前实测返回的是 TTF 而不是 woff2**（font.im 的反代版本较老），但浏览器都支持，体积大一点但对个人站足够。

### 方案 B：本地托管（隐私 + 加载速度）

适合：

- 严格隐私要求（不想把用户 IP 暴露给 Google）
- 部署在国内服务器
- 想完整控制字体子集（subset）

步骤：

1. 下载字体文件（`woff2` 优先）放到 `docs/assets/fonts/`
2. 在 `extra.css` 用 `@font-face` 声明：

```css
@font-face {
  font-family: "LXGW WenKai Screen";
  src: url("../assets/fonts/LXGWWenKaiScreen.woff2") format("woff2");
  font-display: swap;
}

@font-face {
  font-family: "Inter";
  src: url("../assets/fonts/Inter-Regular.woff2") format("woff2");
  font-weight: 400;
  font-display: swap;
}
```

3. 把 `assets/` 目录加进 `git`（Zensical 默认会把 `docs/` 下的内容拷到 `site/`）

### 国内 CDN 选型速查

| CDN | 适用 | 备注 |
| --- | --- | --- |
| **bootcdn**（cdn.bootcdn.net） | 主流 JS 库、霞鹜文楷 webfont | 又拍云，体积大、稳定性高，**本站中文字体用它** |
| **staticfile.org**（cdn.staticfile.org） | npm 包全量镜像 | 又拍云，fontsource 系列字体（Inter、JetBrains Mono、Noto Sans SC 等）都齐全 |
| **font.im**（fonts.font.im） | Google Fonts 反代 | API 100% 兼容 Google Fonts，**本站英文字体用它** |
| **zeoseven**（fontsapi.zeoseven.com） | 中文字体 CDN | 霞鹜文楷、汇文明朝体等，[官网](https://fonts.zeoseven.com/) |
| css.net（cdn.css.net） | cdnjs + Google Fonts 反代 | 备选 |
| fonts.proxy.ustclug.org | Google Fonts 反代（USTC） | 高校运营，长期稳定但**部分 SSL 客户端握手失败**（本站测试不通过） |
| jsdelivr（cdn.jsdelivr.net） | npm + GitHub 全量 | **2021 年起国内访问走国外 IP，不推荐** |

---

## 4. 配置方法（重点！）

### ⚠️ 为什么要 hardcode，不用 CSS 变量

**Zensical 主题的 CSS 变量覆盖是无效的**——原因：

- 主题在 `<head>` 里 inline 注入的变量是 `--md-text-font`（**无 `-family` 后缀**）
- 主题 `main.min.css` 实际消费的是 `--md-text-font-family`（**带 `-family` 后缀**）
- 这是两个不同的变量！覆盖任何一个都不影响另一个

**所以**：直接给元素选择器写 `font-family`，**不走 CSS 变量**。

> 参考：[Wcowin 自定义字体教程](https://wcowin.work/Zensical-Chinese-Tutorial/blog/advanced/custom-fonts/) — Zensical 中文圈最权威的字体配置参考。

### 完整配置（本站）

```css
/* docs/stylesheets/extra.css 顶部 */

/* 1. 引入 Web Font */
@import url("https://cdn.bootcdn.net/ajax/libs/lxgw-wenkai-screen-webfont/1.7.0/style.min.css");
@import url("https://fonts.font.im/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap");

/* 2. body 字体 — 英文优先 + 中文兜底 */
body {
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif,
    "LXGW WenKai Screen", "LXGW WenKai", "霞鹜文楷", sans-serif;
  font-weight: normal;
}

/* 3. 标题字体 */
h1, h2, h3, h4, h5, h6 {
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif,
    "LXGW WenKai Screen", "LXGW WenKai", "霞鹜文楷", sans-serif;
  font-weight: 700;
}

/* 4. 代码块保持等宽,不混 LXGW */
code, pre, kbd, samp {
  font-family: "JetBrains Mono", "Fira Code", "SF Mono", Menlo, Consolas,
    "Liberation Mono", monospace !important;
}

/* 5. 返回顶部按钮 */
button.md-top {
  font-family: "LXGW WenKai Screen", "LXGW WenKai", "霞鹜文楷", sans-serif;
  font-size: 16px;
  font-weight: bold;
}
```

完整版见 [`docs/stylesheets/extra.css`](../stylesheets/extra.css)。

### 简化版（用 zeoseven / 仅中文 / Wcowin 风格）

如果只要霞鹜文楷、不要 Inter 配英文：

```css
@import url('https://fontsapi.zeoseven.com/292/main/result.css');
/* 或 @import url('https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.1.0/style.css'); */

body {
  font-family: "LXGW WenKai", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: normal;
}

code, pre {
  font-family: "JetBrains Mono", "Consolas", monospace !important;
}
```

---

## 5. 性能优化要点

### 5.1 用 `font-display: swap`

`@import` 引入的霞鹜文楷 CSS 默认带 `font-display: swap`——字体没加载完前先显示降级字体，加载完再「交换」。**不要**改回 `block`（会出白屏）或 `fallback`（会有几百毫秒空白）。

### 5.2 字体子集化（subset）

中文字体动辄几 MB，全量加载会拖慢首屏。霞鹜文楷 webfont 包**已经做了按需子集**——浏览器只下载页面里实际用到的字。

自托管时可以用 [中文网字计划](https://chinese-font.netlify.app/) 或 [fonttools subset](https://github.com/fonttools/fonttools) 自己做子集。

### 5.3 预连接

如果用 Google Fonts（或 font.im 反代），可以在 HTML 注入里加 `<link rel="preconnect">`：

```html
<!-- 本站默认国内访客 → font.im 反代 -->
<link rel="preconnect" href="https://fonts.font.im">
<link rel="preconnect" href="https://fonts.gstatic.font.im" crossorigin>

<!-- 切回海外访客时改回 -->
<!-- <link rel="preconnect" href="https://fonts.googleapis.com"> -->
<!-- <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> -->
```

不过 Zensical 主题本身可能已经做了预连接，先看效果再加。

### 5.4 不要引入太多字重

Inter 引入了 4 个字重（400/500/600/700），JetBrains Mono 3 个。**字重越多，下载越大**。如果只用到 400/700，就只引这两个。

---

## 6. 调试 & 验证

### 6.1 改完没生效？

按这个顺序排查：

1. **构建了吗？** 改完 CSS 一定要 `zensical build --clean`，浏览器看到的 CSS 在 `site/stylesheets/extra.css`。
2. **选对元素了吗？** 不要用 `:root{--md-text-font}` 覆盖——**没用**。要直接给 `body` / `h*` / `code` 写 `font-family`。
3. **CDN 拉到了吗？** DevTools → Network → 过滤 `lxgw` / `Inter`，看字体文件是否 200。
4. **浏览器缓存了吗？** 强刷（Cmd+Shift+R）。
5. **CDN 被墙了吗？** 国内访问 `fonts.googleapis.com` 不稳——本站用的是 `fonts.font.im` 反代，如果还是慢，去 [国内 CDN 选型速查](#cdn) 换一个。

### 6.2 怎么确认中文用上了霞鹜文楷？

- **DevTools → Elements** → 选中一个中文字符 → Computed → `font-family` 应该看到 `"Inter", system-ui, ..., "LXGW WenKai Screen", ...`
- **DevTools → Network** → 过滤 `lxgw` → 看是否有 `lxgwwenkaiscreen-subset-*.woff2` 文件 200

### 6.3 怎么测试本地？

```bash
source .venv/bin/activate
zensical serve     # http://localhost:8000
```

打开几个页面，重点看：

- 中文段落（应该用霞鹜文楷，不会是宋体）
- 英文 / 数字（应该用 Inter）
- 标题（应该跟正文字体一致）
- 代码块（应该用 JetBrains Mono）

---

## 7. 换字体的步骤

想换中文字体（比如从霞鹜文楷换成思源黑体）：

1. 改 `@import` URL——去 bootcdn / cdnjs 搜「Noto Sans SC」找最新版本
2. 改 `body` / `h*` / `code` 的 `font-family` 列表（出现 4 处）
3. 重新 `zensical build --clean`
4. 浏览器强刷（Cmd+Shift+R）看效果

想加新英文字体：

1. 去 [Google Fonts](https://fonts.google.com/) 选字体 → 复制 `css2?family=...` 那段
2. 在国内访客场景下，把 URL 的 `fonts.googleapis.com` 换成 `fonts.font.im`（gstatic 也跟着换 `fonts.gstatic.font.im`）
3. 加 `@import url(...)`
4. 把字体名加到 `body` 字体列表的**最前面**（在 Inter 之前，让新字体优先）
5. build + 验证

---

## 8. 参考

- **[Wcowin: Zensical 自定义字体教程](https://wcowin.work/Zensical-Chinese-Tutorial/blog/advanced/custom-fonts/)** — 本文核心方案来源,Zensical 中文圈最权威的字体配置参考
- **[Wcowin: Zensical 中文教程](https://wcowin.work/Zensical-Chinese-Tutorial/)** — Zensical 全方位中文教程,本站 zensical 目录很多最佳实践都参考这个
- [Zensical 官方文档](https://zensical.org/)
- [Material for MkDocs — 自定义字体](https://squidfunk.github.io/mkdocs-material/customization/fonts/) — Zensical 的上游,变量命名参考
- [霞鹜文楷 GitHub](https://github.com/lxgw/LxgwWenKai)
- [霞鹜文楷 webfont 教程](https://github.com/lxgw/LxgwWenKai/issues/24)
- [中文网字计划](https://chinese-font.netlify.app/) — 字体子集化工具
- [Google Fonts](https://fonts.google.com/) — 英文字体库
- [zeoseven 字体服务](https://fonts.zeoseven.com/) — 国内中文字体 CDN
- [font.im](https://font.im/) — Google Fonts 国内反代
