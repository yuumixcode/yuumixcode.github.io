# Localization 问题清单

## 为什么设置了 `Project Locale Identifier` 为中文，但是实际上打开时显示中文，然后变成英文？没有任何代码逻辑去设置 SelectedLocale 为英文。

通常首先是命令行，然后系统，然后再到指定的 Locale。

`Command Locale Selector -> System Locale Selector -> Specified Locale Selector`

macOS 上 Unity 进程未正确继承系统语言文化的已知问题。

macOS 上 System Locale Selector 返回的 Locale 不一定等于 `Application.systemLanguage`。

---

## 当某个 `StringTable` 没有设置为 Preload 时，它的加载方式是怎样的？为什么切换过一次、第二次切换还会闪烁？

### 非预加载表的加载方式

与**预加载（Preload）**表不同，未设置 Preload 的 `StringTable` **不会在初始化阶段被加载**。它采用**惰性（按需）异步加载**：

- 初始化时，`LocalizationSettings` 只加载标记为 Preload 的表（通过 `PreloadOperation`）。
- 未预加载的表，第一次被请求时（例如 `LocalizedString` / `LocalizeStringEvent` 或 `StringDatabase.GetTableAsync`）才会通过 `StringDatabase.GetTableAsync` **异步**加载到内存。

### 为什么“已经获取过”第二次切换还会闪烁

关键在于：`StringTable` 是**引用计数（基于 Addressable 句柄）**管理的。

- `LocalizedString` / `LocalizeStringEvent` 组件在 **locale 发生变化时**，会先 **释放上一个 locale 表的句柄**，再请求新 locale 的表。
- 假设你切换到 locale B：B 表被加载并进入 `StringDatabase` 缓存（引用计数 +1）。
- 当你切回 locale A：组件释放 B 表的句柄（引用计数 -1 → 0），**B 表从缓存中被移除，底层 AssetBundle / 资源随之卸载**。
- 当你**第二次切回 B**：B 表已不在缓存中，`GetTableAsync` 必须**重新异步加载**它。在表就绪的那一帧之前，文本没有可用内容（或仍是旧文本）→ 这就是你看到的**闪烁**。

所以结论是：**“获取过一次”并不保证它一直留在内存里。** 表只在“仍有至少一个句柄引用（引用计数 > 0）”时才留在缓存。一旦被释放，再次切换就要重新加载。

### 为什么预加载的字体资产表不闪

你那个**预加载的字体资产表**在初始化时就被加载，并且由系统一直持有其句柄（引用计数始终 > 0），所以无论怎么切换都是即时可用、不会重新加载，也就不会闪烁。两者的差异正是 Preload 标志决定的。

### 如何消除闪烁

1. **最简单**：在表的设置里把该 `StringTable` 标记为 **Preload**，让它在初始化时就被加载并常驻缓存。
2. **手动保活**：如果你不想全部预加载，可以在进入相关界面/场景时显式预加载并**持有其句柄不放（不调用 `ReleaseTable`）**，这样它始终留在缓存，切换即命中。
3. **提前预加载**：在切换 locale 之前，用 `LocalizationSettings.StringDatabase.PreloadTableOperation` / `GetTableAsync` 把目标表先加载好，再进行切换，避免切换帧的加载空隙。

> 补充：`StringTable` 与 `AssetTable`（字体资产等）共用同一套 `LocalizedDatabase` 缓存与引用计数机制，因此上述结论对两者一致适用。

---

## 完整的表格加载与释放流程

下面以一张 `StringTable`（逻辑对 `AssetTable` 同样适用）为例，串起从初始化到释放的整个生命周期。

### 1. 初始化（InitializationOperation）

- `LocalizationSettings.InitializationOperation` 运行，按顺序确定 `SelectedLocale`：`Command Locale Selector → System Locale Selector → Specified Locale Selector`。
- 初始化结束后，系统执行 **`PreloadOperation`**：加载所有标记为 **Preload** 的表（针对当前 `SelectedLocale`）。

### 2. 请求加载（GetTableAsync）

当 `LocalizedString` / `LocalizeStringEvent` / `LocalizedStringTable` 需要显示，或你手动调用：

```csharp
StringDatabase.GetTableAsync(tableReference, locale);
```

**关于 `tableReference` 参数**：它不是单纯的“表名称字符串”，而是 `UnityEngine.Localization` 中的 `TableReference` 结构体，用来引用**一个表集合（StringTableCollection / TextTable）**，有两种标识方式：

- **按名称（string）**：`new TableReference("MyTextTable")`。
- **按 GUID**：`TableReference.FromGuid(...)`。编辑器里 `LocalizedString` 的 Table Reference 字段底层实际存的是 GUID，因此改表名也不会断开引用。

关键点：`tableReference` 指向的是**整个表集合（跨语言的那个 Collection）**，**不是某一种语言的表**；具体选哪张语言表，由第二个参数 `locale` 决定。两者合起来才定位到一张具体的键值对表：`GetTableAsync` 返回的就是该 Collection 在指定 locale 下的那张 `StringTable`（对应语言的 key→value 表）。

`LocalizedDatabase` 内部流程：

1. 以 `(tableReference, locale)` 为键，在**缓存**中查找。注意：这里的「值」是**整张 `StringTable` 对象**（该 Collection 在该语言下全部 key→value 的集合），**而不是某一条具体的翻译结果**。
2. **命中缓存**（引用计数 > 0）：直接返回整张表的句柄，同步、即时，引用计数 **+1**。
3. **未命中缓存**：创建异步操作，从 AssetBundle / 资源加载整张表；加载完成后放入缓存，引用计数设为 **1**，再返回句柄。
4. **取具体翻译（二级查找）**：拿到表后，还需按具体 `key` 在表内取值，例如 `table.GetEntry(key).Value` 或 `GetLocalizedString(key)`。也就是说 `(tableReference, locale)` 只是外层键，取到的是“某语言下整套 key-value”，真正的单条翻译要再用 key 取一层。

> 两级索引示意：`缓存: (tableReference, locale) → 整张 StringTable`；`表内: key → 单条翻译 value`。

### 3. 缓存与引用计数

- 缓存键为 `(表引用, Locale)`。
- 每次 `GetTableAsync` 返回句柄 → 引用计数 **+1**；每次 `ReleaseTable` → 引用计数 **-1**。
- 只要引用计数 **> 0**，表就保留在内存；归零即被移出缓存。

### 4. 切换 Locale（SelectedLocaleChanged）

- 设置 `LocalizationSettings.SelectedLocale = newLocale`，或选择器自动变更，触发 **`SelectedLocaleChanged`** 事件。
- 所有订阅该事件的组件依次执行：
  1. **释放旧 locale 表的句柄** → `ReleaseTable`，引用计数 **-1**。
  2. **为新 locale 请求表** → `GetTableAsync`。
- 分支：
  - 新表是 **Preload**：已在缓存且被系统持有（引用计数 > 0）→ 立即返回，**无加载空隙，不闪**。
  - 新表 **非 Preload**：缓存未命中则异步加载，期间文本为空 / 旧值 → **闪烁**。
  - 旧 locale 的表若此时引用计数归零 → 从缓存移除，底层资源释放。

### 5. 释放（ReleaseTable）

- 触发时机：手动调用 `StringDatabase.ReleaseTable(tableReference, locale)`；或组件在 **locale 切换** / **销毁（OnDestroy）** 时自动释放。
- 引用计数归零后：表从缓存移除，关联的 Addressable 句柄 `Release`；若再无其他引用，其 **AssetBundle 卸载、内存释放**。

### 6. 退出 / 重置

- `LocalizationSettings` 清理时释放所有持有的句柄，缓存清空。

> 一句话总结流程：**Preload 在初始化即常驻 → 请求时命中缓存即时返回、否则异步加载并 +1 → locale 切换时先释放旧表再请求新表 → 引用计数归零即卸载。** 理解这条链路，就能解释“为何获取过第二次还会闪”（旧表被释放后缓存已无，必须重新加载）。

---

## StringTable 的数据结构：是不是「嵌套字典 + 竖着看」？

可以这样理解，而且这个视角恰好能解释“切换 locale 是换了一张表”。

### 数据结构：`Collection → (Locale → (Key → Value))`

一个 `StringTableCollection`（代码中引用的 `TableReference`）由两部分组成：

- **`SharedTableData`（共享表数据）**：定义所有 key（如 `UI_Title`），**跨语言只存一份**，被该 Collection 下所有 locale 表共享。
- **多个 `StringTable`（按 locale 分表）**：每个 locale 一张**独立的表资产文件**，负责把 key 映射到该语言的 value。

运行时的访问路径正是：**先拿到某个 locale 对应的那张 `StringTable`，再按 key 取出 value**。即概念上等价于嵌套字典：

```text
Collection
  └─ Locale A  →  { key1: valueA1, key2: valueA2, ... }
  └─ Locale B  →  { key1: valueB1, key2: valueB2, ... }
```

key 在所有 locale 间保持一致（来自 `SharedTableData`），只有 value 随 locale 不同。

### 编辑器里的“网格”只是视图，物理上仍是按 locale 分表

String Tables 编辑窗口为了方便填写，把数据拍平成一张网格：

- **左侧** = key（来自 `SharedTableData`）
- **上方** = 各 locale 名称
- **交叉格** = 该 locale 下该 key 的 value

但底层存储是**每一列（每个 locale）就是一个独立的 `StringTable` 资产**。所以你说的“竖着看”——每一列就是该语言下完整的一套 key-value——在物理结构上是准确的。网格只是把多张按 locale 分表合并呈现的编辑视图。

### 与前面闪烁问题的关联

正因为切换 locale = 从 Locale A 的 `StringTable` 资产换到 Locale B 的 `StringTable` 资产（key 共享、value 来源换表），那张新表若没有 Preload、且上一轮句柄已被释放，就必须重新加载——这正是第二次切换仍然闪烁的根因。
