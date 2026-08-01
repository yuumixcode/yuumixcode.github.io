# Localization 踩坑日志 · 录制逐字稿

> 配套 slides: `unity-localization-pitfall-log-slides.html`(15 页)
> 录制环境:Unity 2022.3.62f3c1 | Localization 1.5.3 | Addressables 1.22.3
> 预估时长:8-10 分钟

---

## Slide 1 / 15 · Cover

今天聊 **Unity Localization**。

文档写得挺漂亮,API 也算干净,但真到项目里用起来,有三个**没人告诉你的隐藏契约**,一不小心就原地爆炸。

环境:Unity **2022.3.62f3c1**、Localization 1.5.3、Addressables 1.22.3。版本不同行为可能略有差异,自己测一遍。

---

## Slide 2 / 15 · Agenda

三个坑,按"为什么崩 → 怎么修 → 关键原则"走:

- **①** init 的 Completed 回调里切语言 → `ArgumentException`
- **②** 切换语言时闪烁 → StringTable 和 AssetTable 异步竞速
- **③** 退出时访问 `SelectedLocale` → 系统语言污染存档

开始。

---

## Slide 3 / 15 · Pitfall 1 · 标题

第一个坑最隐蔽。

**不要在 `InitializationOperation` 的 Completed 回调里调 `SetSelectedLocale`。**

100% 复现——报的是个看起来完全无关的 `ArgumentException`,搜半天不知道为啥。

---

## Slide 4 / 15 · Pitfall 1 · 为什么崩

看时序图。

`Complete()` 内部**同步触发** Completed 回调——调用栈还没展开,你还在 Addressables 的完成逻辑里。这时你调 `SetSelectedLocale`,它内部 `ReleaseAllTables` + 加载新表。

**关键**:`ReleaseAllTables` 只释放表引用,init 预加载的 bundle 还在 Addressables 字典里没清掉。新表加载撞同一个 key,直接抛异常。`Complete()` 永远返回不了,这一帧就死了。

根因不是"Completed 不能用",而是"**调用栈没展开,就在里面启动新的 Addressables 异步操作链**"。

---

## Slide 5 / 15 · Pitfall 1 · 两种修复方式

**方式 A,`IStartupLocaleSelector`(推荐)**。

把语言选择烘焙进初始化流程。`GetStartupLocale` 里从存档读代码,从 `available` 取对应 Locale 返回,读不到返回 null 交给下一个 Selector。

在 `LocalizationSettings.asset` 的 Inspector 加到 **Startup Locale Selectors 第一位**。零冗余——初始化一开始就知道选啥。

**方式 B,协程 yield 等 init 结束(兜底)**。

`yield return op` 让协程挂起,等 `Complete()` **完全返回、调用栈展开**后再恢复执行,这时调 `SetSelectedLocale` 就安全了。`if (!op.IsDone) yield return op;` 兜个边界。

**为啥 yield 安全而 Completed 不安全?** yield 让 Unity 把控制权交出去,等 Addressables 更新循环跑完才恢复;Completed 是同步插入,栈没展开。

---

## Slide 6 / 15 · Pitfall 1 · 关键原则

记一条原则:

**Completed 是同步委托调用,但其中不能启动新的 Addressables 异步操作链。**

普通同步 API(`SetActive`、设文本、读已加载数据)在 Completed 里都没问题。**禁区只限于**会改 Addressables 资源状态的操作——`SetSelectedLocale` 内部就是这么干,所以是禁区。

---

## Slide 7 / 15 · Pitfall 2 · 标题

第二个坑是体验问题,不崩,但用户看得出来。

**切换语言时,文本和字体不是同时更新的。**

肉眼能看出来——先变字体后变文本,或反过来。日文/韩文/阿拉伯文渲染成方块那种,特别明显。100% 复现,不是偶发。

---

## Slide 8 / 15 · Pitfall 2 · 为什么闪

`SetSelectedLocale(B)` 做两件事:先 `ReleaseAllTables(A)`,然后**并行**加载 B 的 StringTable 和 AssetTable(字体在 AssetTable)。

两个表完成时间不一致——文本先变,字体晚几十毫秒,中间就是"用 A 的字体渲染 B 的文本"。切回 A 同样问题,A 的表刚被释放又要重载。

---

## Slide 9 / 15 · Pitfall 2 · 让切换瞬间完成

核心思路:**让表已经在内存里**,切语言就是改指针,无加载延迟。

**方式 A,Preload All Tables(语言少时推荐)**。

`LocalizationSettings.asset` 把每种语言的 Preload 都勾上。init 时所有 StringTable 和 AssetTable 全加载并常驻,切语言瞬间完成。

代价是多占内存——多 2-3 种语言可能多个几十 MB。语言 2-5 种的项目可接受。

**方式 B,代码持有 Table 引用**。

持 `LocalizedStringTable` 这种组件的引用,订阅 `TableChanged`——系统为新语言重载表并通知你,而不是彻底释放。内存可控,但要自己管理引用。

---

## Slide 10 / 15 · Pitfall 3 · 标题

第三个坑最恶心。

**退出游戏时不要访问 `LocalizationSettings.SelectedLocale`。**

**不会在开发期暴露**——退出时悄悄发生,下次启动玩家选的语言被静默改成系统默认。

---

## Slide 11 / 15 · Pitfall 3 · 为什么崩 · 触发链

退出 Play Mode,`LocalizationSettings.ResetState()` 清空 `m_SelectedLocaleAsync` 缓存。

然后你的代码(存档回调、OnGUI、timer)访问 `SelectedLocale`——系统检测缓存无效,走 `GetSelectedLocaleAsync` → `SelectActiveLocale`。

**重点**:这一步不是"返回当前语言",而是**从头跑初始化管线**。

---

## Slide 12 / 15 · Pitfall 3 · Selector 链掉链子

`SelectActiveLocale` 遍历你的 Selector 列表:

- `SavedLocaleSelector` → null(Domain 销毁中,访问存档上下文失败)
- `CommandLineSelector` → null(正常)
- `SystemLocaleSelector` → **ja**(系统语言,兜底命中)

`SelectedLocaleChanged` 事件触发,你的回调把 **ja 写进存档**。

玩家精心选的 zh-CN 被静默覆盖,下次启动看到 ja——日志里一切正常。

**这就是状态污染的可怕之处:当下看不出问题,问题发生在下次启动。**

---

## Slide 13 / 15 · Pitfall 3 · 核心原则

**用字符串缓存语言代码,退出时读缓存,绝不碰 Localization 系统。**

看代码分两层:

**Model 层**:纯字段 `_languageCode` + `CurrentLanguageCode` 只读属性,完全不碰 `LocalizationSettings`。

**Service 层**:`OnInitialize` 加载设置 + 订阅 `SelectedLocaleChanged`(在回调里把 `locale.Identifier.Code` 同步到 `_languageCode`)+ 订阅 `Application.quitting`。

退出时 `OnApplicationQuitting`:

1. **先** `-= OnSelectedLocaleChanged`
2. **再** `SaveGameSettings()`

**顺序不能反**。先存盘再取消订阅,Localization 清理阶段会再触发一次回调,白忙活。

---

## Slide 14 / 15 · Summary

三句话:

**①** Completed 是同步回调,但其中不能启动新的 Addressables 异步操作链。语言选择走 `IStartupLocaleSelector`,或 yield 等 init 结束。

**②** 闪烁 = StringTable 和 AssetTable 异步竞速。Preload 让表常驻,或代码持引用。

**③** 退出用字符串缓存语言代码,断订阅后再保存,防系统语言污染。

记这三条,cover 90% 的坑。

---

## Slide 15 / 15 · Thanks

本期就到这里。

其他 Localization 诡异问题,评论区或博客下方留言,一起聊。

下期见,拜拜 👋
