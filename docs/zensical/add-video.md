# Zensical 添加视频指南

本文演示如何在 Zensical 中嵌入 YouTube / 哔哩哔哩视频。两个平台均**完全免费、无需 API key**，使用原生 `<iframe>` 嵌入官方播放器，可在 Chrome / Edge / Firefox / Safari 等主流浏览器中正常播放。

> 加载后从 **第 0 秒** 开始，**不自动播放**，由访客手动点击播放。

## YouTube 嵌入示例

下面是嵌入后的实际效果：

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

对应 Markdown 代码：

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

## 哔哩哔哩嵌入示例

下面是嵌入后的实际效果：

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

对应 Markdown 代码：

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

## 技术说明

- **嵌入方案（两个平台均免费）**：
  - **YouTube**：原生 iframe 播放器（`youtube.com/embed/视频ID`），免费、免注册、免付费。
  - **哔哩哔哩**：原生 iframe 播放器（`player.bilibili.com/player.html?bvid=视频ID&page=分P`），同样免费、无需 API key，使用 B 站官方分享弹窗生成的嵌入代码即可。
- **均从 0 秒开始、不自动播放**：YouTube 移除 `?start=` 参数即从开头播放；B 站追加 `&t=0` 同样从开头播放。两个 iframe 的 `allow` 属性均不含 `autoplay`，因此页面加载后不会自动播放，需访客手动点击。
- **响应式**：外层用 `padding-bottom: 56.25%`（16:9）实现自适应宽高比，在手机到桌面屏都不变形。
- **隐私增强（YouTube 可选）**：可将域名换成 `youtube-nocookie.com`，功能与兼容性完全一致。

## 更换视频

- **YouTube**：改 `src` 中的视频 ID（如需指定起始时间再加 `?start=秒`）。
- **哔哩哔哩**：改 `bvid` 与 `page`（起始时间用 `&t=秒`）。

两处均默认不自动播放。
