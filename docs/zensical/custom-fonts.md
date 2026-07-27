# Zensical 自定义字体指南

> 怎么在 Zensical 里换中文字体、英文字体、代码字体。

Zensical 基于 Material for MkDocs，主题里所有字体走 **CSS 变量** 管理。要换字体，就是覆盖这几个变量 + 把字体文件用 `@import` 或本地 `@font-face` 引进来。

本指南以本站配置（中文 **霞鹜文楷** + 英文 **Inter** + 代码 **JetBrains Mono**）为例，给出从思路到落地的完整流程。

---

## 1. 字体变量一览

Zensical 主题的字体都挂在 `:root` 上，按用途分这几个：

| 变量 | 用途 | 默认（modern 主题） |
| --- | --- | --- |
| `--md-text-font` | 正文 | Roboto |
| `--md-text-font--bold` | 粗体正文 | Roboto |
| `--md-text-font--italic` | 斜体 | Roboto |
| `--md-text-font--small` | 小字（页脚、版权） | Roboto |
| `--md-heading-font` | 标题 | Roboto Slab |
| `--md-code-font` | 代码（内联 + 代码块） | Roboto Mono |
| `--md-monospace-font` | 等宽（备用） | Roboto Mono |

> Material 默认字体栈本身就是面向拉丁字母的——**它没有中文字形**。这就是为什么中文站不显式改字体时，中文会回退到系统的「宋体 / 苹方 / 微软雅黑」之类，跟英文混排不协调。

---

## 2. 中英文混排的核心思路

`font-family` 是个**有序列表**，浏览器对**每个字符**单独选字体——找到一个能渲染的就停。所以中英混排的策略是：

```css
font-family: "英文字体优先, 中文字体兜底, sans-serif";
```

- 看到 `a-zA-Z0-9` → 用第一个能渲染的英文字体
- 看到 `一-鿿` → 前几个英文字体都「不会这个字」，继续往下找，找到中文字体为止
- 都找不到 → `sans-serif` 兜底

具体到本站：

```css
--md-text-font:
  "Inter", system-ui, -apple-system, "Segoe UI", Roboto,    /* 英文优先栈 */
  "Helvetica Neue", Arial, sans-serif,                       /* 英文继续 */
  "LXGW WenKai Screen", "LXGW WenKai", "霞鹜文楷", sans-serif;  /* 中文兜底 */
```

这样每个字符都走最合适的字体，混排也协调。

---

## 3. 字体推荐

### 中文

| 字体 | 风格 | 推荐场景 | 协议 |
| --- | --- | --- | --- |
| **霞鹜文楷 / LXGW WenKai** | 楷体，文艺感 | 个人站、博客、文档 | SIL OFL 1.1 |
| 思源黑体 / Noto Sans SC | 黑体，正式感 | 商业站、官方文档 | SIL OFL 1.1 |
| 思源宋体 / Noto Serif SC | 宋体，传统 | 学术、长文阅读 | SIL OFL 1.1 |
| 得意黑 / Smiley Sans | 标题黑体 | 标题、Logo | SIL OFL 1.1 |

霞鹜文楷分几个版本：
- **完整版**：字形最全，文件大（几 MB）
- **Lite 版**：剔除罕用字，适合内嵌
- **Screen 版**：屏幕阅读优化，body 文本友好（**本站选这个**）
- **TC 繁体版**：旧字形 + 繁体

### 英文

| 字体 | 风格 | 搭配 |
| --- | --- | --- |
| **Inter** | 无衬线，现代 | 霞鹜文楷 / 思源黑体 |
| Ysabeau | 无衬线，霞鹜官方推荐 | 霞鹜文楷 |
| system-ui | 系统原生 | 不想引入字体时 |

本站选 **Inter**——开源、字重齐全、跟霞鹜文楷的「书卷气」搭配协调。

### 代码

| 字体 | 特点 |
| --- | --- |
| **JetBrains Mono** | 等宽、支持 ligature（`=>` `!=` `>=` 这种连字），本站选用 |
| Fira Code | 老牌 ligature 字体 |
| LXGW Bright Code | 霞鹜文楷 + Monaspace 合并版 |
| SF Mono / Consolas | 系统原生 |

---

## 4. 三种接入方式

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
> font.im API 跟 Google Fonts 100% 兼容——换 URL 就行，不用改 font-family 或字符集。**目前实测返回的是 TTF 而不是 woff2**（font.im 的反代版本较老），但浏览器都支持，体积大一点但对个人站足够。

然后在 `zensical.toml` 里确认 `extra_css` 已经指向了 extra.css（默认就是）：

```toml
[project]
extra_css = ["stylesheets/extra.css"]
```

#### 国内 CDN 选型速查

| CDN | 适用 | 备注 |
| --- | --- | --- |
| **bootcdn**（cdn.bootcdn.net） | 主流 JS 库、霞鹜文楷 webfont | 又拍云，体积大、稳定性高，**本站中文字体用它** |
| **staticfile.org**（cdn.staticfile.org） | npm 包全量镜像 | 又拍云，fontsource 系列字体（Inter、JetBrains Mono、Noto Sans SC 等）都齐全 |
| **font.im**（fonts.font.im） | Google Fonts 反代 | API 100% 兼容 Google Fonts，**本站英文字体用它** |
| css.net（cdn.css.net） | cdnjs + Google Fonts 反代 | 备选 |
| fonts.proxy.ustclug.org | Google Fonts 反代（USTC） | 高校运营，长期稳定但**部分 SSL 客户端握手失败**（本站测试不通过） |
| jsdelivr（cdn.jsdelivr.net） | npm + GitHub 全量 | **2021 年起国内访问走国外 IP，不推荐** |

> 如果你用 **fontsource**（`@fontsource/inter`、`@fontsource/jetbrains-mono`），走 **staticfile.org** 也很稳：
> ```css
> @import url("https://cdn.staticfile.org/@fontsource/inter/5.0.0/400.css");
> @import url("https://cdn.staticfile.org/@fontsource/inter/5.0.0/500.css");
> /* ... 多个 weight 一个一个引 */
> ```
> 但 fontsource 是**每个 weight 一个 CSS 文件**，引 4 个 weight 要写 4 行 @import，不如 font.im 一行搞定。

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

### 方案 C：`<link>` 标签直插（不推荐）

可以在 Markdown 里用 HTML 注入 `<link>`，但**不如 `@import` 干净**——`<link>` 加载阻塞渲染，`@import` 可以配合 `media="print" onload` 异步化（Material 主题原版字体就这么干的）。

---

## 5. 完整配置示例（本站）

把以下内容放到 `docs/stylesheets/extra.css` **最顶部**：

```css
/* 1. 引入 Web Font */
@import url("https://cdn.bootcdn.net/ajax/libs/lxgw-wenkai-screen-webfont/1.7.0/style.min.css");
@import url("https://fonts.font.im/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap");

/* 2. 覆盖 Material 字体变量 */
:root {
  --md-text-font: "Inter", system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif,
    "LXGW WenKai Screen", "LXGW WenKai", "霞鹜文楷", sans-serif;

  --md-text-font--bold: /* 同上，省略 */;
  --md-text-font--italic: /* 同上，省略 */;
  --md-text-font--small: /* 同上，省略 */;
  --md-heading-font: /* 同上，省略 */;

  --md-code-font: "JetBrains Mono", "Fira Code", "SF Mono", Menlo, Consolas,
    "Liberation Mono", monospace,
    "LXGW WenKai Screen", "LXGW WenKai", "霞鹜文楷", monospace;

  --md-monospace-font: var(--md-code-font);
}
```

完整版见 [`docs/stylesheets/extra.css`](../stylesheets/extra.css)。

---

## 6. 性能优化要点

### 6.1 用 `font-display: swap`

`@import` 引入的霞鹜文楷 CSS 默认带 `font-display: swap`——字体没加载完前先显示降级字体，加载完再「交换」。**不要**改回 `block`（会出白屏）或 `fallback`（会有几百毫秒空白）。

### 6.2 字体子集化（subset）

中文字体动辄几 MB，全量加载会拖慢首屏。霞鹜文楷 webfont 包**已经做了按需子集**——浏览器只下载页面里实际用到的字。

自托管时可以用 [中文网字计划](https://chinese-fonts.netlify.app/) 或 [fonttools subset](https://github.com/fonttools/fonttools) 自己做子集。

### 6.3 预连接

如果用 Google Fonts（或 font.im 反代），可以在 `extra_javascript` 或自建 HTML 注入里加 `<link rel="preconnect">`：

```html
<!-- 本站默认国内访客 → font.im 反代 -->
<link rel="preconnect" href="https://fonts.font.im">
<link rel="preconnect" href="https://fonts.gstatic.font.im" crossorigin>

<!-- 切回海外访客时改回 -->
<!-- <link rel="preconnect" href="https://fonts.googleapis.com"> -->
<!-- <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> -->
```

不过 Zensical 主题本身可能已经做了预连接，先看效果再加。

### 6.4 不要引入太多字重

Inter 引入了 4 个字重（400/500/600/700），JetBrains Mono 3 个。**字重越多，下载越大**。如果只用到 400/700，就只引这两个。

---

## 7. 调试 & 验证

### 7.1 改完没生效？

按这个顺序排查：

1. **构建了吗？** 改完 CSS 一定要 `zensical build --clean`，浏览器看到的 CSS 在 `site/stylesheets/extra.css`。
2. **变量名写对了吗？** 名字打错会静默失败，浏览器回退到默认。
3. **`font-display: swap` 生效了吗？** DevTools → Network → 过滤 `font` → 看字体下载状态。下载完没切？说明字体本身没加载到。
4. **CSS 优先级够吗？** 如果主题里有更具体的选择器，可能盖不过去。试着用 `:root` 或加 `!important`。
5. **CDN 被墙了吗？** 国内访问 `fonts.googleapis.com` 不稳——本站用的是 `fonts.font.im` 反代，如果还是慢，去 [国内 CDN 选型速查](#cdn) 换一个（bootcdn / staticfile / css.net）。

### 7.2 怎么确认中文用上了霞鹜文楷？

DevTools → Elements → 选中一个中文字符 → Computed → `font-family` 看到 `LXGW WenKai Screen`。

或者更直接：DevTools → Network → 过滤 `lxgw`，看字体文件是否被请求。

### 7.3 怎么测试本地？

```bash
source .venv/bin/activate
zensical serve     # http://localhost:8000
```

打开几个页面，重点看：
- 中文段落（应该用霞鹜文楷，不会是宋体）
- 标题（应该跟正文字体一致或显式区分）
- 代码块（应该用 JetBrains Mono）
- 数字、英文段落（应该用 Inter）

---

## 8. 换字体的步骤

想换中文字体（比如从霞鹜文楷换成思源黑体）：

1. 改 `@import` URL——去 bootcdn / cdnjs 搜「Noto Sans SC」找最新版本
2. 改 `font-family` 列表里的字体名（出现两处：`--md-text-font` / `--md-code-font`）
3. 重新 `zensical build --clean`
4. 浏览器强刷（Cmd+Shift+R）看效果

想加新英文字体：

1. 去 [Google Fonts](https://fonts.google.com/) 选字体 → 复制 `css2?family=...` 那段
2. 在国内访客场景下，把 URL 的 `fonts.googleapis.com` 换成 `fonts.font.im`（gstatic 也跟着换 `fonts.gstatic.font.im`）
3. 加 `@import url(...)`
4. 把字体名加到 `--md-text-font` 列表的**最前面**
5. build + 验证

---

## 9. 参考

- [Zensical 官方文档](https://zensical.org/)
- [Material for MkDocs — 自定义字体](https://squidfunk.github.io/mkdocs-material/customization/fonts/)
- [霞鹜文楷 GitHub](https://github.com/lxgw/LxgwWenkai)
- [霞鹜文楷 webfont 教程](https://github.com/lxgw/LxgwWenkai/issues/24)
- [中文网字计划](https://chinese-fonts.netlify.app/) — 字体子集化工具
- [Google Fonts](https://fonts.google.com/) — 英文字体库
