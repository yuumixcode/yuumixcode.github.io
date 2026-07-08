# Summary 工具 (Summary Tool)

通过右键菜单快捷处理 C# 脚本中的 XML `<summary>` 注释与 `[Summary]` 特性之间的双向同步。

## 使用场景

当你的团队要求公共成员同时具备 XML 文档注释和 `[Summary]` 特性时——手动维护两份内容相同但格式不同的注释既繁琐又容易遗漏。Summary Tool 正是为此而设计的。它从 XML 注释中提取摘要，自动生成对应的 `[Summary]` 特性，确保两者始终保持同步。

## 核心优势

- **⚡ 右键即用**：在 Project 窗口选中脚本，右键即可执行，无需打开额外窗口。
- **🔄 三种模式**：同步（Sync）、替换（Replace）、移除（Remove），覆盖日常维护的全部需求。
- **📦 批量处理**：支持多选脚本同时处理，批量同步或清理。
- **🧠 智能导入**：处理完成后自动添加 `using RunLab.AesirInspector;`，无需手动补引用。
- **🏗️ 宏定义感知**：自动识别 `#if` 等预处理指令，确保 `[Summary]` 特性插入在条件编译块内部。

## 工作原理

`XmlSummaryTool` 的处理流程分为三个阶段：**解析 → 分组 → 输出**。

### 1. 解析阶段

将源代码按行扫描，定位第一个 `///` 注释，将其之前的所有行标记为 **Header**（using、namespace 等），之后的部分进入分组阶段。

### 2. 分组阶段

从第一个 `///` 开始，交替提取 **XML 注释块**（连续的 `///` 行）和 **代码块**（非 `///` 行），生成 `XmlCodePart` 列表。每个 `XmlCodePart` 由 `xml`（注释部分）和 `code`（代码部分）组成。

### 3. 输出阶段

根据选择的模式，对每个 `XmlCodePart` 执行不同的操作：

| 模式 | 输出组合 | 说明 |
|------|---------|------|
| **Sync** | `xml` + `前导预处理` + `[Summary]` + `删除首个[Summary]后的code` | 保留 XML 注释，在预处理指令之后添加/更新 `[Summary]`；若已有 `[Summary]` 则替换为 XML 中的内容 |
| **Replace** | `移除summary后的xml` + `前导预处理` + `[Summary]` + `删除首个[Summary]后的code` | 移除 `<summary>` 标签，用 `[Summary]` 特性替代；已有 `[Summary]` 的内容同步为 XML 中的文本 |
| **Remove** | `xml` + `前导预处理` + `删除所有[Summary]后的code` | 仅移除所有 `[Summary]` 特性，保留 XML 注释 |

### 宏定义感知

当代码块以 `#if`、`#elif`、`#else` 等预处理指令开头时，`[Summary]` 特性会插入在这些指令之后（即条件编译块内部），而非之前。例如：

```csharp
// 输入
/// <summary>编辑器方法</summary>
#if UNITY_EDITOR
[Summary("旧内容")]
public void Reset() { }
#endif

// Sync 输出 — [Summary] 在 #if 内部
/// <summary>编辑器方法</summary>
#if UNITY_EDITOR
[Summary("编辑器方法")]
public void Reset() { }
#endif
```

最后，输出阶段会自动检测 Header 中是否已包含 `using RunLab.AesirInspector;`，若未包含则自动添加。
