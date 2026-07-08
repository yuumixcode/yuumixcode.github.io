# 设计原则与路线图

本页记录 AesirArchitecture 的设计铁律、已交付与规划中的能力，以及许可证信息。

## 设计原则

1. **Unity 原生优先** — 优先使用 Unity 引擎能力（PlayerLoop、ScriptableObject、Editor API），而非自建平行体系。
2. **Domain Reload 兼容（铁律）** — 静态变量必须显式重置，反复进出 Play Mode 无残留。
3. **低 MonoBehaviour 依赖** — 核心框架由纯 C# 对象组成，MonoBehaviour 仅作适配层。
4. **渐进式** — 小项目轻量使用，大项目逐步扩展，不强制全量引入。
5. **SO 与纯代码双通道**（规划中） — 每个 SO 能力都有纯 C# 替代方案。
6. **团结引擎优先** — 以团结引擎为一等公民。

## 路线图

### 已完成 ✅

- 核心 MVP / MVC 分层
- PlayerLoop 原生生命周期注入
- 命令模式（同步 + 异步）
- ObservableValue 响应式属性
- MiniEventBus 类型事件总线
- GenericLocator 泛型定位器
- AbstractSubmodule 统一子模块生命周期
- 运行时错误日志（替代前置依赖校验）
- Engine 层脱离 Component 层（纯 C#）
- Domain Reload 安全

### 规划中 🔲

- ScriptableObject 可视化配置层
- SO EventChannel 事件通道
- Editor 工具链（SO Inspector / MVP 脚手架 / 模块可视化）
- 运行时集合（RuntimeSet）

## 许可证

本项目采用 [MIT 许可证](https://github.com/yuumixcode/aesir-architecture/blob/main/LICENSE.md) 开源。
