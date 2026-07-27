# qiaomu-bento-ppt 使用指南

> 目标:搞清楚 `joeseesun/qiaomu-bento-ppt` 这个外部 AI skill 在干什么、它产出的 HTML 长什么样,以及**能不能塞进本站的 Zensical 静态站**,怎么塞。

## 1. 一句话结论

- 它生成**单文件、可离线、可编辑、可演示**的演示文稿,后缀 `.bento.html`
- 产出**不是普通网页**,是 1 个文件 = 1 个 deck(16:9 画布,1280×720)
- 能进本站。**用 `<iframe>` 嵌入到 Markdown 页面里**,Bento 自带 viewer/editor 跑在 iframe 里,站点导航在 iframe 外面包着
- 不需要 bento 源码 checkout,不需要 API key,不需要联网运行时

## 2. 它产出的 HTML 是什么

打开任意一个 `.bento.html`,结构是固定的:

```text
┌────────────────────────────────────────────────┐
│ <!DOCTYPE html>                                │
│ <head>                                         │
│   bento shell 的 <style>、元数据、NOTICE       │
│   启动动画 CSS                                 │
│ </head>                                        │
│ <body>                                         │
│   <script type="application/bento+json"        │  ← 唯一可变区域
│           id="bento-doc">                      │
│     {                                          │
│       "format": "bento/slides",                │
│       "version": 1,                            │
│       "docId": "<uuid>",                       │
│       "title": "My deck",                      │
│       "size": { "width": 1280, "height": 720 } │
│       "theme": { ... },                        │
│       "slides": [ ... ]   ← 一页 = 一个对象     │
│     }                                          │
│   </script>                                    │
│   <body> + 内嵌 bento 运行时(DEFLATE 压缩)     │
└────────────────────────────────────────────────┘
```

**两条关键约束**(format spec 写死):

1. `<` 必须在 JSON 里转义成 `\u003c`,否则 `</script>` 会提前关掉文档块
2. 文档块**永远不**承载可执行代码 — text HTML 仅白名单内联标签,chart option 仅纯 JSON,不允许 function

slide 元素支持 6 种类型:`text` / `shape` / `image` / `svg` / `chart` / `table` / `media`。所有动画(morph / ken-burns / countUp / dash-march / motion-path)**只在 present 模式跑**,编辑器画布上看到的是静态。

## 3. 能不能用在本站 — 兼容性分析

本站栈:Zensical(Rust 静态站生成器)+ MiniJinja 模板 + GitHub Pages 部署 + 零成本约束。

| 维度 | qiaomu-bento-ppt 产物 | Zensical 站 | 兼容? |
| --- | --- | --- | --- |
| 形态 | 单文件 `.bento.html` | 多页 + 左导航 + 顶 tabs | ❌ 不是同类东西 |
| 自包含 | 是(data + runtime + editor) | 静态站 = 多文件互链 | ✅ 单文件可直接托管 |
| 浏览器运行 | 双击打开 = 演示 + 编辑 | `zensical build` 后静态托管 | ✅ 都是纯浏览器 |
| 资源 | 图片/字体可内嵌 `data:` | 静态站 `docs/assets/` | ✅ 都能离线 |
| 部署 | 单文件,任意 HTTP | GitHub Pages 自动构建 | ✅ 都走标准静态托管 |
| 嵌入第三方页面 | 是独立 viewer | iframe 友好 | ✅ 唯一可行集成方式 |
| 多页导航 | 无(deck 内部换页) | 站点级 nav | ⚠️ iframe 内外两套导航 |

**结论**:不能也不应该把 bento 改成 Zensical 主题的一部分(等于重新实现一遍 bento runtime)。正确姿势是**iframe 嵌入**。

## 4. 在本站落地的做法

### 4.1 目录约定

按 AGENTS.md 规范,生成的 `.bento.html` **不**放进 `docs/ai/` 下面(那里是 Markdown 源),也不放进 `docs/assets/`(那是给站内引用的图片/字体)。给它开一个独立目录:

```text
docs/
├── ai/
│   ├── index.md
│   └── bento-presentation-guide.md
└── presentations/                ← bento 演示文稿放这里
    ├── 2026-unity-localization-talk.bento.html
    └── ...
```

`docs/presentations/` 不在 `nav` 里(它是资源目录,不是页面),`build` 时 zensical 会原样拷贝到 `site/presentations/`。

### 4.2 安装 skill(只用一次)

```bash
npx skills add joeseesun/qiaomu-bento-ppt

# 验证
python3 ~/.agents/skills/qiaomu-bento-ppt/scripts/bento_deck.py locate
# 期望输出:"standalone": true
```

不联网、不需要 bento 源码 checkout、`upstream.lock.json` 已经把官方 shell 和规范钉死。

### 4.3 生成 bento.html

新建:

```bash
python3 ~/.agents/skills/qiaomu-bento-ppt/scripts/bento_deck.py build deck.json \
  --output presentations/2026-unity-localization-talk.bento.html \
  --new-document \
  --report reports/deck-validation.json
```

编辑已有 deck(保留 `docId` 和原始 shell):

```bash
python3 ~/.agents/skills/qiaomu-bento-ppt/scripts/bento_deck.py extract \
  presentations/2026-unity-localization-talk.bento.html \
  --output deck.json

# 改 deck.json(注意: < 仍然要转义成 \u003c)

python3 ~/.agents/skills/qiaomu-bento-ppt/scripts/bento_deck.py build deck.json \
  --identity-source presentations/2026-unity-localization-talk.bento.html \
  --output presentations/2026-unity-localization-talk.updated.bento.html \
  --report reports/deck-validation.json
```

### 4.4 放进站点

```bash
# 把产物拷到 docs/presentations/(不进 nav)
cp 2026-unity-localization-talk.bento.html \
   docs/presentations/2026-unity-localization-talk.bento.html
```

### 4.5 写一个 Markdown 页面来嵌入它

`docs/ai/bento-presentation-guide.md` 这种页面里,直接用 `<iframe>` 嵌。

Markdown 默认不让写 HTML,需要 zensical 的 `md_in_html` 扩展。`zensical.toml` 里加一行:

```toml
[project.markdown_extensions]
md_in_html = true
```

然后在页面里这样写:

```html
<div class="bento-frame">
  <iframe
    src="../presentations/2026-unity-localization-talk.bento.html"
    title="Unity Localization Talk"
    loading="lazy"
    allowfullscreen
  ></iframe>
  <p class="bento-frame-caption">
    打开有困难?
    <a href="../presentations/2026-unity-localization-talk.bento.html">下载 .bento.html</a>
    在浏览器里双击即可演示和编辑
  </p>
</div>
```

### 4.6 让 iframe 在桌面/手机都不变形

`docs/stylesheets/extra.css` 追加:

```css
/* ---------- bento deck iframe 嵌入 ---------- */
.bento-frame {
  position: relative;
  width: 100%;
  max-width: 1100px;
  margin: 1.5rem auto;
  border-radius: 12px;
  overflow: hidden;
  background: #0a0a0a;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.bento-frame::before {
  content: "";
  display: block;
  padding-top: 56.25%;   /* 16:9 锁定比例 */
}

.bento-frame iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}

.bento-frame-caption {
  margin: 0.75rem 0 0;
  padding: 0 0.25rem;
  font-size: 0.85rem;
  color: var(--slides-muted, #737373);
  text-align: center;
}
```

锁定 16:9(56.25%)的容器 + `position: absolute` 撑满,bento 内置 1280×720 画布在任何屏幕都不会被压扁。

## 5. 限制与坑

- **iframe 内键盘快捷键被捕获** — bento present 模式用方向键换页,在 iframe 里按方向键是给 bento 的,不会触发外层站点的滚动。鼠标滚轮/PageDown 还会冒泡,可能让外层跟着滚
- **iframe 内链接跳转** — bento 里的 `link` 字段跳到 state slide 不会跳出 iframe,但如果你用 `target="_blank"` 配合外链就会开新 tab。约定:`link` 只指向 deck 内部 id,外链另开
- **移动端不友好** — bento 是桌面优先的 16:9 画布,小屏塞进 iframe 后按钮和文字都会变小,触摸热区可能 < 40px。如果要给手机看,优先用 `readonly: true` 模式只读播放,或者直接下载文件
- **离线保证** — 默认 bento 文件已经自包含(数据 + 运行时 + 编辑器),不需要联网。**不要**在 deck JSON 里塞外链图片/视频,会把"双击就开"的离线体验破坏掉
- **生成产物不入版本控制?** — 看情况:放 `docs/presentations/` 跟 Markdown 源一起进 git,build 产物 `site/presentations/` 仍在 `.gitignore`。优点是部署即可用,缺点是 repo 体积会涨。**推荐入仓**,因为 bento 文件就是终态交付物,丢源 = 丢成品
- **不要把 bento 文件路径放进 `nav`** — 它不是 Markdown 页面,放进去 zensical 找不到会报 broken link。让它只通过 Markdown 页面里的 iframe 引用
- **`<` 转义** — 直接编辑 deck.json 时,所有 `<` 必须是 `\u003c`,包括 `</script>` 这种关键词,否则 bento runtime 加载时 document 块会提前关掉。**不要绕过 bento_deck.py 自己手拼 HTML** — 用脚本保证转义和 shell 完整
- **bento.shell 是固定版本** — skill 自带的 shell 不会自动升级,新版本 bento 上游发布后要等 `sync_upstream.py` 同步 + 跑完整门禁(standalone / identity / shell / fixture / browser)才安全。普通使用别手动改 shell

## 6. 验证清单(每加一个 bento deck 跑一次)

- [ ] `python3 scripts/bento_deck.py validate deck.json` 无 error
- [ ] `python3 scripts/validate_skill.py` 通过
- [ ] 真浏览器打开 .bento.html:封面、至少一页内容页、present 模式、字体/图片/图表都正常,无横向滚动
- [ ] 真浏览器打开 Zensical 站点对应页面:iframe 16:9 比例正确,小屏不被压扁
- [ ] `zensical build --clean` 无 broken link、无 warning
- [ ] 下载链接可点(用户没桌面浏览器时降级路径)
- [ ] 演示用素材全部内嵌,无外链

## 7. 参考

- [qiaomu-bento-ppt GitHub](https://github.com/joeseesun/qiaomu-bento-ppt) — skill 仓库,MIT 协议
- [bento/slides 格式规范](https://github.com/nyblnet/bento/blob/main/plugins/bento-slides/skills/bento-slides/format.md) — 上游 format spec,本指南的字段定义都来自这里
- [bento/slides authoring guide](https://bento.page/agents.md) — "怎么写出好看的 deck" 的内容映射规则(chart/table/morph/state/ken-burns 的使用场景)
- 本站 Zensical 笔记:[`docs/zensical/`](../zensical/index.md)— 改 `zensical.toml` 时参考
