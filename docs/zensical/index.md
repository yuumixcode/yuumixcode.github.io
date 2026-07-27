# Zensical

> [Zensical](https://zensical.org/) 是本站使用的静态站点生成器,基于 Python + MiniJinja,部署在 GitHub Pages。
>
> 这里记录踩过的坑、最佳实践,以及所有「非默认行为」的说明。

## 索引

- **[添加视频指南](add-video.md)** — 怎么嵌入 YouTube / 哔哩哔哩 视频(免 API、零成本)
- **[自定义字体指南](custom-fonts.md)** — 怎么换中文字体、英文字体、代码字体(中英分离 fallback 链)

## 站点关键决策

- **框架**:Zensical(基于 Material for MkDocs)
- **主题**:`modern` 变体,语言 `zh`
- **字体**:中文「霞鹜文楷」+ 英文 Inter + 代码系统 monospace(详见[字体指南](custom-fonts.md))
- **样式**:`docs/stylesheets/extra.css` 集中管理所有自定义 CSS
- **部署**:GitHub Pages,工作流 `.github/workflows/`
