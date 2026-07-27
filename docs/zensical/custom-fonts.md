# Zensical 自定义字体指南

!!! question "怎么在 Zensical 换中英文字体?为什么 `:root{--md-text-font: ...}` 覆盖没生效?"
    主题有两个不同的字体变量(注入的 `--md-text-font` ≠ 实际消费的 `--md-text-font-family`),光改 `:root` 没用的。**直接给 `body` 写 `font-family`**——参考 Wcowin 教程的极简方案,3 个文件搞定。

## 步骤概览

1. **选字体组合**:中文 + 英文 + 代码各选一个(见下文"细节解释"里的推荐)
2. **选 CDN**:国内访客走反代(zeoseven 中文 / font.im 英文),海外直接 Google Fonts
3. **列到 zensical.toml 的 `extra_css`**:把字体 CSS URL 直接写在配置里
4. **写 extra.css**:`body { font-family: "英文字体", "中文字体"; }` + code 块强制等宽
5. **build + 强刷**:`zensical build --clean`,浏览器 Cmd+Shift+R

> 整站大概改 **3 个文件**:`zensical.toml` + `docs/stylesheets/extra.css` + 重启 `serve`。

---

## 演示区:本站配置

### `zensical.toml` 的 `extra_css` 段

```toml
extra_css = [
    "stylesheets/extra.css",
    "https://fontsapi.zeoseven.com/292/main/result.css",          # 霞鹜文楷 LXGW WenKai(zeoseven CDN,中文)
    "https://fonts.font.im/css2?family=Inter:wght@400;500;600;700&display=swap",  # Inter(font.im 反代,英文)
]
```

### `docs/stylesheets/extra.css` 关键片段

```css
/* 中英分离:英文走 Inter(无中文字形),中文回退到 LXGW WenKai */
body {
  font-family: "Inter", "LXGW WenKai";
  font-weight: normal;
}

/* 标题继承 body,显式声明以防主题特殊处理 */
h1, h2, h3, h4, h5, h6 {
  font-family: "Inter", "LXGW WenKai";
  font-weight: 600;
}

/* 代码块用系统 monospace,不引外部字体 */
code, pre, kbd, samp {
  font-family: ui-monospace, "SFMono-Regular", "Menlo", "Consolas", monospace;
}

/* 返回顶部按钮 */
button.md-top {
  font-family: "LXGW WenKai";
  font-size: 16px;
  font-weight: bold;
}
```

---

## 细节解释

### 关于步骤 1:字体推荐

| 类别 | 字体 | 风格 | 协议 |
| --- | --- | --- | --- |
| 中文 | **霞鹜文楷(LXGW WenKai)** | 楷体,文艺 | SIL OFL 1.1 |
| 中文 | 思源黑体(Noto Sans SC) | 黑体,正式 | SIL OFL 1.1 |
| 中文 | 思源宋体(Noto Serif SC) | 宋体,传统 | SIL OFL 1.1 |
| 英文 | **Inter** | 无衬线,现代 | SIL OFL 1.1 |
| 英文 | system-ui | 系统原生 | — |
| 代码 | **JetBrains Mono** | 等宽 + ligature | SIL OFL 1.1 |
| 代码 | ui-monospace | 系统原生 | — |

**本站选法**:中文 LXGW WenKai + 英文 Inter + 代码 ui-monospace(系统等宽,无外部依赖)。

霞鹜文楷分几个版本(体积 / 字形不同):
- **完整版**:字形全,几 MB
- **Screen 版**:屏幕阅读优化,**本站选这个**
- **Lite 版**:剔除罕用字,适合内嵌
- **TC 繁体版**:旧字形 + 繁体

### 关于步骤 2:国内 CDN 选型速查

| CDN | 适用 | 备注 |
| --- | --- | --- |
| **zeoseven**(`fontsapi.zeoseven.com`) | 中文字体(霞鹜文楷、汇文明朝体) | **本站中文用它** |
| **font.im**(`fonts.font.im`) | Google Fonts 反代(Inter / JetBrains Mono) | **本站英文用它** |
| **bootcdn**(`cdn.bootcdn.net`) | 主流 JS 库、霞鹜文楷 webfont | 又拍云,体积大,稳定 |
| **staticfile.org**(`cdn.staticfile.org`) | npm 包全量镜像(fontsource 系列字体) | 又拍云 |
| jsdelivr(`cdn.jsdelivr.net`) | npm + GitHub | **2021 年起国内走国外 IP,不推荐** |
| fonts.proxy.ustclug.org | Google Fonts 反代(USTC) | 高校运营,**部分 SSL 握手失败** |

切回海外访客时,把 `fonts.font.im` 换回 `fonts.googleapis.com`,其他不动。

### 关于步骤 4:为什么不走 CSS 变量

Zensical 主题有两个不同的字体变量:

- 主题在 `<head>` 里 inline 注入的是 `--md-text-font`(**无 `-family` 后缀**)
- 主题 `main.min.css` 实际消费的是 `var(--md-text-font, _)` 合成 `--md-text-font-family`(**带 `-family` 后缀**)

光改 `:root{--md-text-font: "Inter, ..."}` 看似能覆盖(特异性都是 0,1,0,extra.css 后加载),但**实测不生效**——head inline 注入的 `<style>` 和 `<link>` 加载之间有渲染时序差异,inline 的变量会先生效。**直接给 `body` 写 `font-family` 是更稳的方案**。

### 关于步骤 4:中英混排策略

`font-family` 是个**有序列表**,浏览器对**每个字符**单独选字体——找到能渲染的就停。

| 策略 | 写法 | 效果 |
| --- | --- | --- |
| **A. 英文优先(本站)** | `"Inter", "LXGW WenKai"` | 英文用 Inter,中文回退 LXGW |
| **B. 中文优先(Wcowin)** | `"LXGW WenKai", sans-serif` | 中英文都走 LXGW(楷体英文) |

策略 A 的英文更现代,策略 B 的整体感更统一。Wcowin 自己的网站用 B。

### 关于步骤 4:代码块等宽

`code` / `pre` / `kbd` / `samp` 必须**强制等宽**——LXGW WenKai 也包含拉丁字符(楷体英文),如果让它接管,代码块会变成"楷体英文 + 中文楷体",失去等宽特征。

本站的写法是**不引外部等宽字体**,直接用系统 monospace stack(`ui-monospace`, `Menlo`, `Consolas`)。这样:

- 零外部依赖
- 性能最好(系统字体不下载)
- 视觉上能区分"代码 vs 正文"

### 关于性能优化

| 优化点 | 做法 | 收益 |
| --- | --- | --- |
| `font-display: swap` | 字体没下载完先显示降级字体 | 不出白屏 |
| 字体子集化 | zeoseven / 霞鹜文楷 webfont 已自动按需子集 | 首屏只下载用到的字 |
| 预连接(preconnect) | 提前跟 CDN 建 TCP / TLS 连接 | 减少 100-300 ms 延迟 |
| 不要引太多字重 | 4 个 weight 比 2 个 weight 多下载一倍的 woff2 | 流量 / 加载时间减半 |

本站只引了 Inter 4 个字重(400/500/600/700),其他一律 fallback。

### 关于调试:改了没生效?

按这个顺序排查:

1. **build 了吗?** 改完 CSS 一定要 `zensical build --clean`,浏览器看的是 `site/stylesheets/extra.css`。
2. **CSS 选对元素了吗?** 不要写 `:root{--md-text-font}`(无效),要直接写 `body { font-family: ... }`。
3. **CDN 拉到了吗?** DevTools → Network → 过滤 `lxgw` / `Inter` / `woff2`,看字体文件是否 200。
4. **浏览器缓存了吗?** DevTools → Network → 勾上 `Disable cache`,再强刷(Cmd+Shift+R)。
5. **CDN 被墙了吗?** 国内访问 `fonts.googleapis.com` 会被墙,必须用 `fonts.font.im` 反代。

DevTools → Elements → 选中一个中文字符 → Computed → `font-family` 应该看到 `..., "LXGW WenKai", ...`,中文字形可渲染。

---

## 换字体的步骤

想换中文字体(比如从霞鹜文楷换成思源黑体):

1. 改 `extra_css` 里的字体 CSS URL(去 bootcdn / cdnjs 搜「Noto Sans SC」找最新版本)
2. 改 `body` / `h*` 的 `font-family` 列表
3. 重新 `zensical build --clean`
4. 浏览器强刷(Cmd+Shift+R)看效果

想加新英文字体:

1. 去 [Google Fonts](https://fonts.google.com/) 选字体 → 复制 `css2?family=...` 那段 URL
2. 国内场景下,把 `fonts.googleapis.com` 换成 `fonts.font.im`
3. 加到 `extra_css`
4. 把字体名加到 `body` 字体列表的**最前面**(让新字体优先)
5. build + 强刷验证

---

## 参考

!!! tip "Wcowin 自定义字体教程"
    [Wcowin 写的 Zensical 自定义字体完整指南](https://wcowin.work/Zensical-Chinese-Tutorial/blog/advanced/custom-fonts/)——Zensical 中文圈最权威的字体配置参考,**本站字体方案的核心来源**

- [Wcowin 完整 Zensical 中文教程](https://wcowin.work/Zensical-Chinese-Tutorial/) — 全方位教程,本站多个指南都参考这个
- [Zensical 官方文档](https://zensical.org/)
- [Material for MkDocs — 自定义字体](https://squidfunk.github.io/mkdocs-material/customization/fonts/) — Zensical 的上游,变量命名参考
- [霞鹜文楷 GitHub](https://github.com/lxgw/LxgwWenKai) — 字体源仓库
- [霞鹜文楷 webfont 教程](https://github.com/lxgw/LxgwWenKai/issues/24) — 如何用 `cn-font-split` 切子集
- [中文网字计划](https://chinese-font.netlify.app/) — 字体子集化工具,自托管时用
- [Google Fonts](https://fonts.google.com/) — 英文字体库
- [zeoseven 字体服务](https://fonts.zeoseven.com/) — 国内中文字体 CDN
- [font.im](https://font.im/) — Google Fonts 国内反代
