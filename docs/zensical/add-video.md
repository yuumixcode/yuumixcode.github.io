# Zensical 添加视频指南

!!! question "怎么在 Zensical 嵌入 YouTube / 哔哩哔哩视频?"
    两个平台都**免费、免 API key、免注册**,用原生 `<iframe>` 嵌官方播放器即可,Markdown 里直接贴 HTML。

## 步骤概览

1. **拿到视频 ID**:YouTube 复制 `?v=xxx` 后面的 ID(11 位);B 站分享弹窗里复制 BV 号。
2. **套 HTML 模板**:复制下面"演示区"里的 HTML,把视频 ID 替换掉。
3. **粘贴到 Markdown**:直接贴 HTML 代码块或写到 .md 文件里(支持 inline HTML)。

> 加载后**从第 0 秒开始**,**不自动播放**,由访客手动点击。

---

## 演示区

### YouTube 嵌入

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.15);">
  <iframe
    src="https://www.youtube.com/embed/O09xl00L7RI"
    title="YouTube 视频演示"
    frameborder="0"
    loading="lazy"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>

对应模板(改视频 ID 即可):

```html
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.15);">
  <iframe
    src="https://www.youtube.com/embed/视频ID"
    title="YouTube 视频演示"
    frameborder="0"
    loading="lazy"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>
```

### 哔哩哔哩嵌入

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.15);">
  <iframe
    src="https://player.bilibili.com/player.html?bvid=BV1c9MM6mEBe&page=1&t=0"
    title="哔哩哔哩视频案例"
    frameborder="0"
    loading="lazy"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>

对应模板(改 `bvid` / `page` / `t` 即可):

```html
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.15);">
  <iframe
    src="https://player.bilibili.com/player.html?bvid=视频BV号&page=分P&t=0"
    title="哔哩哔哩视频案例"
    frameborder="0"
    loading="lazy"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>
```

---

## 细节解释

### 关于步骤 1:怎么拿 ID

- **YouTube**:打开视频 → 浏览器地址栏 `https://www.youtube.com/watch?v=O09xl00L7RI` → `v=` 后面那段就是 ID。
- **哔哩哔哩**:视频页 → 点分享 → 弹窗里"嵌入代码"或 URL 里的 `BVxxxxxx`。

### 关于步骤 2:16:9 自适应原理

外层 `div` 用 `padding-bottom: 56.25%` 实现"宽高比 = 16:9"——浏览器在 width 100% 时自动算出对应 height。`iframe` 用 `position: absolute` 铺满外层。

这意味着手机 / 桌面 / 平板各种宽度下,视频都不会变形、不会出现黑边。

### 关于"不自动播放"

`allow` 属性里**不包含** `autoplay`,所以页面加载后不会自动开始。访客必须手动点播放按钮——对博客 / 文档站友好(不打扰阅读)。

### 关于隐私增强(YouTube 可选)

把域名 `youtube.com` 换成 `youtube-nocookie.com`——YouTube 不会在用户点播放前设置 cookie,符合 GDPR。功能完全一致。

```html
<!-- 普通 -->
<iframe src="https://www.youtube.com/embed/视频ID" ...>

<!-- 隐私增强 -->
<iframe src="https://www.youtube-nocookie.com/embed/视频ID" ...>
```

### 关于起始时间参数

- **YouTube**:`?start=120` 表示从 2 分钟开始(单位:秒)。
- **哔哩哔哩**:`&t=120` 表示从 2 分钟开始(单位:秒,跟 YouTube 一致)。

---

## 更换视频

| 平台 | 改的字段 |
| --- | --- |
| YouTube | `src` 里的视频 ID(需指定起点再加 `?start=秒`) |
| 哔哩哔哩 | `bvid`(视频 ID)、`page`(分P)、`t`(起始秒) |

改完保存,**强刷**(Cmd+Shift+R)看效果——Zensical 不需要重启 serve。

---

## 参考

!!! tip "Zensical 通用嵌入技巧"
    视频嵌入的 HTML 模板 / 16:9 自适应 / 隐私增强,跟平台无关,本站的"自定义字体指南"也用了同样的"直接写 HTML 不依赖插件"思路。详见 [Wcowin 的 Zensical 自定义字体教程](https://wcowin.work/Zensical-Chinese-Tutorial/blog/advanced/custom-fonts/)(Wcowin 是 Zensical 中文圈最权威的教程作者)

- [YouTube iframe Player 参数文档](https://developers.google.com/youtube/player_parameters)
- [哔哩哔哩嵌入播放器文档](https://socialsisteryi.github.io/bilibili-API-Site/docs/thirdparty/embed.html)
