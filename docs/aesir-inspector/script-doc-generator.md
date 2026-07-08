# 脚本文档生成器 (Script Doc Generator) ⚡

通过反射分析 C# 类型信息，生成结构化的 API 文档，支持增量生成与个性化扩展。

> 标注 ⚡ 表示需要安装 Odin Inspector 才启用此编辑器工具。

## 使用场景

当你的团队、开源项目或个人项目需要一份 API 文档时——不仅需要自动生成的类型签名，还需要针对 API 补充个性化说明（使用示例、注意事项、业务上下文等）——Script Doc Generator 正是为此而设计的。它负责生成准确的 API 签名部分，你来补充那部分只有人才写得出的内容，两者互不干扰，增量更新。

## 核心优势

- **🔒 完全离线**：基于 C# 反射机制运行，无需网络连接、无需外部 API、无需第三方服务。断网环境、内网开发、机密项目——随时随地可用。
- **⚡ 零等待**：反射分析在毫秒级完成。选中类型，文档即现。没有进度条，没有等待。
- **🎮 与 Unity 一体**：作为 Editor 原生扩展运行，直接在 Inspector 中操作。无需切换窗口、无需外部工具链——文档就在你编写代码的地方。
- **✏️ 增量生成**：重新生成文档时，自动保留 `## 额外说明` 标识符之后的手写内容，已有 Front Matter（YAML/TOML 头部）也会保留。自动生成的签名与人工补充的说明互不覆盖。
- **🤖 AI 友好**：默认生成 Markdown 格式文档，结构清晰、语义明确，可直接用于构建 AI API 问答知识库（RAG、Embedding 等），让 AI 助手精准回答项目 API 相关问题。
- **🔧 可配置与可扩展**：提供多种配置项与扩展接口，适配不同项目的文档需求。

## 功能详情

- **类型分析**：支持类、结构体、接口、枚举、委托、Record 等类型的完整签名与特性解析，包含泛型约束、基类继承与接口实现。
- **字段解析**：覆盖全部 C# 原始类型、集合类型、委托类型、特殊类型（abstract/dynamic/interface/nullable），以及 const/static 默认值、访问修饰符、复合关键字（const/static readonly/readonly）、Unity 内置类型与特性标注。
- **属性解析**：支持 getter/setter 不对称访问修饰符（如 `public get / private set`）、静态属性、默认值初始化。
- **方法解析**：支持泛型方法、参数默认值、`params` 可变参数、`async` 异步方法、运算符重载、扩展方法。
- **继承分析**：识别 virtual/abstract/override 方法与接口实现，追踪继承链来源。
- **辅助功能**：成员排序（`DerivedMemberDataComparer`）、方法重载标记、构造方法签名生成、事件签名生成。

## 可配置项

| 配置项 | 说明 |
|-------|------|
| 文档输出路径 | 自定义文档生成的目标文件夹，支持拖拽设置 |
| 按命名空间生成文件夹 | 开启后按类型的命名空间自动创建子目录，如 `RunLab.AesirInspector` → `RunLab/AesirInspector/` |
| 自定义文档扩展名 | 默认 `.md`，可切换为 `.mdx`、`.txt` 等任意扩展名 |
| 增量生成标识符 | 开启后自动在文档末尾插入 `## 额外说明` 段落，重新生成时保留该段落之后的手写内容 |
| 类型来源模式 | 单类型 / 多类型 / 整个程序集，三种粒度按需选择 |
| TypesCacheSO | 将 Type 列表保存为可复用的资源文件，避免每次重新选择 |

## 可扩展接口

| 接口 | 说明 |
|------|------|
| `DocGeneratorSettingsSO` | 继承此抽象类并实现 `GetGeneratedDoc(ITypeData)` 方法，即可自定义文档的格式与内容。内置了 `CnScriptingAPISettingsSO`（中文 API Markdown 文档生成器）作为参考实现 |
| `IAnalysisDataFactory` | 替换整个类型分析工厂，自定义成员数据的解析逻辑 |
| `IAttributeFilter` | 自定义特性过滤器，控制哪些特性出现在生成的文档中 |

## 单元测试覆盖

Script Doc Generator 目前已包含 **153 个单元测试**，覆盖各数据类型的签名生成功能：

| 测试模块 | 测试数 | 说明 |
|---------|-------|------|
| **FieldData** · 签名 | 41 | 原始类型、集合类型、委托类型、特殊类型的 Signature 生成 |
| **FieldData** · 默认值 | 32 | const 常量与 static 静态字段的默认值生成，含 decimal 边界情况验证 |
| **FieldData** · 修饰符 | 10 | 复合关键字与全部 6 种访问修饰符 |
| **FieldData** · Unity | 7 | Unity 内置类型与特性标注 |
| **PropertyData** | 13 | 静态属性默认值、getter/setter 不对称访问修饰符组合 |
| **MethodData** · 通用 | 11 | 泛型方法、默认参数、params、async、静态方法 |
| **MethodData** · 继承 | 5 | virtual/abstract/override 与接口实现的继承分析 |
| **MethodData** · 运算符 | 8 | 算术运算符重载、隐式/显式类型转换运算符 |
| **MethodData** · 扩展 | 1 | 扩展方法的签名生成与 `[Ext]` 标记 |
| **ConstructorData** | 1 | 构造方法签名生成，含基类构造调用 |
| **EventData** | 6 | Action/Func/Predicate/Comparison 等委托类型事件及静态事件 |
| **TypeData** | 14 | class/struct/interface/enum/delegate/record/static/sealed/generic 等类型声明 |
| **MemberData** · 继承 | 4 | 字段/属性/事件/方法从基类继承的 `IsFromInheritance` 标记 |
