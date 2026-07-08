# 视频演示

下面这段 YouTube 视频通过原生 `<iframe>` 嵌入，使用 YouTube 官方播放器，**完全免费、无需 API key**，可在 Chrome / Edge / Firefox / Safari 等主流浏览器中正常播放。

视频会自动从 **第 470 秒（7 分 50 秒）** 开始播放。

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.15);">
  <iframe
    src="https://www.youtube.com/embed/O09xl00L7RI?start=470"
    title="YouTube 视频演示"
    frameborder="0"
    loading="lazy"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>

## 技术说明

- **嵌入方案**：YouTube 原生 iframe 播放器（`youtube.com/embed/视频ID`）。免费、免注册、免付费。
- **保留起始时间**：URL 末尾的 `?start=470` 参数让视频从 470 秒处开始（470 秒 = 7 分 50 秒）。
- **响应式**：外层用 `padding-bottom: 56.25%`（16:9）实现自适应宽高比，在手机到桌面屏都不变形。
- **隐私增强（可选）**：若希望减少跟踪，可将域名换成 `youtube-nocookie.com`，功能与兼容性完全一致。

> 如需更换视频，只需修改 `src` 中的视频 ID 与 `start` 数值即可。
