# 双语 UI 与 Odin 桥接

本页介绍 Aesir Inspector 的两块与 Odin 紧密相关的增强能力：**双语 UI 特性**（需要 Odin）与 **OdinBridge 桥接层**（让核心程序集在无 Odin 时也能编译运行）。

## 双语 UI 特性 (Bilingual Attributes) ⚡

提供了一套完整的双语属性装饰器与 Inspector Control，支持在 Inspector 面板中同时显示中文和英文信息。主要面向以下场景：

- **编辑器工具开发**：希望 Inspector 界面支持中英双语显示，让不同语言背景的用户都能直观理解各项参数与操作。
- **团队协作**：跨地区、跨语言的团队在共享项目时，双语显示可有效降低沟通成本，避免因语言差异导致的误操作。

可用装饰器与 Control：

- `[BilingualTitle]`
- `[BilingualButton]`
- `[BilingualInfoBox]`
- `[BilingualText]`
- `BilingualDisplayAsStringControl` 双语只读文本显示控件
- `BilingualHeaderControl` 双语头部信息控件
- `HorizontalSeparateControl` 水平分隔线控件

## OdinBridge 桥接层

提供 Odin Inspector 可选集成机制，使核心程序集不依赖 Odin，同时允许 OdinIntegration 程序集在 Odin 可用时提供增强功能：

| 类 | 说明 |
|----|------|
| `IOdinBridge` | Odin 可用性查询接口，定义 `IsOdinPresent` 等能力 |
| `DefaultOdinBridge` | 无 Odin 时的默认桥接实现 |
| `OdinBridgeLocator` | 运行时自动定位 Odin 桥接，无 Odin 时回退至 `DefaultOdinBridge` |
| `OdinInspectorBridge` | Odin 可用时提供的编辑器侧增强桥接实现 |

> 桥接层的设计让 Aesir Inspector 的**核心功能（Summary 工具、安全编辑器工具、文档生成器运行时等）完全不依赖 Odin**，仅在导入 Odin 后自动启用增强程序集。这也是为什么无 Odin 环境也能正常编译运行。
