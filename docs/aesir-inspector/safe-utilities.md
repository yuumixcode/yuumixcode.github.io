# 安全编辑器工具与规范

本页汇总 Aesir Inspector 的**安全编辑器工具**（核心程序集，无需 Odin）、**自定义特性**与**代码风格规范**。

## 安全编辑器工具 (Safe Editor Utilities)

针对 Unity Editor API 进行了安全封装，确保编辑器专用代码在打包后自动剔除：

| 工具类 | 说明 |
|-------|------|
| `ScriptableObjectSafeEditorUtility` | 提供更可靠的 ScriptableObject 资产创建与管理 |
| `MonoScriptSafeEditorUtility` | 根据脚本名称查找、选择 MonoScript 资源 |
| `PathUtility` | 路径字符串工具：Unity 路径规范化、子路径提取、路径合并 |
| `PathSafeEditorUtility` | 确保 Assets 目录下文件夹存在的安全创建工具 |
| `HierarchySafeEditorUtility` | 获取 GameObject 在 Hierarchy 中的绝对路径 |
| `HierarchyUtility` | Transform 层级路径操作：完整路径、相对路径、深层子物体查找 |
| `ProjectSafeEditorUtility` | Ping 并选中项目中任意资源（支持文件夹路径） |
| `UrlUtility` | 便捷的 URL 打开与外部链接处理 |
| `ReflectionUtility` | 程序集与命名空间的反射操作工具 |
| `PredefinedAssemblyUtility` | 预定义程序集类型识别与接口实现类型查找 |
| `PlayerLoopUtility` | 自定义 Unity PlayerLoop：插入、移除子系统，打印 PlayerLoop 结构 |
| `RegexUtility` | 正则表达式工具：命名空间/类名规范化、邮箱/URL 校验 |
| `AesirInspectorLogger` | 统一日志输出，带彩色前缀，编译后自动剔除，双击可跳转调用方；可通过 `AesirInspectorLoggerSettings` 配置日志级别 |

## 自定义特性 (Custom Attributes)

| 特性 | 说明 |
|------|------|
| `[Summary]` | 注释特性，等同于 XML 注释的 `<summary>` 部分，可在运行时通过 `GetSummary()` 获取摘要文本 |

## 代码风格与规范

本项目将代码风格视为与功能同等重要的组成部分。内置严格的代码编写标准与示例，确保团队协作中的代码一致性与可维护性：

- **风格指南**：详见仓库 `Runtime/CodeStyle/AESIR_INSPECTOR_CODE_STYLE.cs`。
- **设计理念**：良好的代码风格不是可选项，而是项目质量的基石。所有贡献者均需遵循本规范。
