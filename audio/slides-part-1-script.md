# Localization 踩坑日志讲解稿(TTS 三段版)

> 每段 ≤ 600 字符(TTS 上限),独立可用,合成 3 个 mp3
> 语速 1.0、青年男声、neutral 情绪
> 标点制造节奏停顿(逗号=短停,句号=长停,"。"优先于";")

### 段 1 / 3 — 导言 + 坑 ①

大家好，我是 Yuumix ，最近在学习 Unity 的 Localization 包时，发现了一些问题，使用 Unity 版本是 2022 LTS ，Localization 是 1.5.3。

本视频简单讲解一下三个注意事项。

【根据内容读三个点】



第一个坑。不要在 InitializationOperation 的 Completed 回调中调用 SetSelectedLocale。原因是 Completed 事件在 Complete 方法内部同步触发,调用栈还没展开。这时切语言会启动新的 Addressables 异步链,把同一个 bundle key 重复塞进虚拟资源字典,直接抛 ArgumentException。两种修法:推荐 IStartupLocaleSelector,把语言选择烘焙进初始化流程,零冗余;兜底用协程 yield,等 init 真正结束再切。核心原则:Completed 回调本身是安全的同步委托调用,但不能启动新的 Addressables 异步操作链。

### 段 2 / 3 — 坑 ②

第二个坑,切语言时的闪烁。SetSelectedLocale 释放旧表后,StringTable 和 AssetTable 走两条独立的异步加载链,一个 50 毫秒完,一个 120 毫秒完,中间会出现先字体后文本的撕裂,切回原语言同样问题。解法两种。第一种,让所有语言的 StringTable 和 AssetTable 在初始化时全部常驻内存,Preload All Tables,切换就是改指针,零延迟,代价是内存占用增加,适合 2 到 5 种语言的项目。第二种,代码里持有 LocalizedStringTable 引用,订阅 TableChanged 事件,系统会为新语言重新加载表并通知你,而不是彻底释放,内存可控但需要手动管理引用。

### 段 3 / 3 — 坑 ③ + 总结

第三个坑,退出游戏时不要访问 SelectedLocale。退出 Play Mode 时 ResetState 会清空缓存,任何访问都触发完整的重新初始化管线。此时 Domain 正在销毁,自定义 Selector 拿不到上下文,系统语言 Selector 兜底,SelectedLocaleChanged 事件把系统语言写进存档,玩家精心选的语言被静默覆盖。解法:用纯字符串缓存语言代码,退出时先取消订阅 SelectedLocaleChanged,再保存存档,顺序反了会被污染。三句话总结:Completed 里不要启动 Addressables 新链;闪烁的根因是表异步竞速;退出时用字符串缓存语言代码,先取消订阅再保存。踩坑日志原文和 Slides 都在 yuumixcode 的网站,感谢观看。
