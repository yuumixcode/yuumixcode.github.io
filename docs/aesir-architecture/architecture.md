# 架构总览

本页用一张分层图、一张能力矩阵、一棵树形目录，把 AesirArchitecture 的整体结构摊开。

## 分层图

```
┌─────────────────────────────────────────────────┐
│               AbstractContext<T>                 │
│     (泛型静态单例 + Domain Reset)                │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐ │
│  │  Models  │  │ Services │  │ MiniEventBus  │ │
│  │          │  │          │  │   (Global)    │ │
│  └──────────┘  └──────────┘  └───────────────┘ │
│  ┌──────────────────────────────────────────────┐│
│  │       GenericLocator<T> (类型定位器)         ││
│  └──────────────────────────────────────────────┘│
└──────────────────┬──────────────────────────────┘
                   │ 能力接口组合
     ┌─────────────┼─────────────┐
     ▼             ▼             ▼
┌─────────┐ ┌───────────┐ ┌────────────┐
│  IView  │ │IController│ │ IPresenter │
│         │ │  (MVC)    │ │   (MVP)    │
└─────────┘ └───────────┘ └────────────┘
     │             │             │
     ▼             ▼             ▼
┌──────────────────────────────────────┐
│  AesirView<T> / MonoView<T>          │
│  AesirViewController<T>              │
│        (MonoBehaviour 适配层)          │
└──────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│     AesirArchitecturePlayerLoop       │
│  (PlayerLoop 原生注入: Before/After)   │
└──────────────────────────────────────┘
```

## 能力矩阵

| 模块 | GetModel | GetService | ExecuteCommand | AddListener | InvokeEvent | Initialize | Dispose |
|------|:--------:|:---------:|:--------------:|:---------:|:----------:|:----------:|:-------:|
| **IModel** | ✓ | | | | ✓ | ✓ | ✓ |
| **IService** | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ |
| **IView** | ✓ | ✓ | | ✓ | ✓ | | |
| **IController** | ✓ | ✓ | ✓ | | | | |
| **IPresenter** | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ |

## 项目结构

```
cn.runestone.aesir.architecture/
├── package.json
├── README.md
├── CHANGELOG.md
├── LICENSE.md
├── .gitignore
├── Runtime/
│   ├── Runestone.AesirArchitecture.asmdef
│   ├── Engine/                    # 纯 C# + 使用 UnityEngine API（不依赖 MonoBehaviour）
│   │   ├── Common/
│   │   │   ├── AesirArchitectureLog.cs         # 统一日志
│   │   │   ├── AesirArchitecturePlayerLoop.cs  # PlayerLoop 注入
│   │   │   ├── AssemblyInfo.cs                 # InternalsVisibleTo 声明
│   │   │   └── ResetStaticsAssistant.cs        # 静态变量重置助手
│   │   ├── Core/
│   │   │   ├── Context/           # IContext, AbstractContext<T>
│   │   │   ├── Modules/           # IModel, IService, IView, IController, IPresenter + Abstract 基类
│   │   │   │   ├── Interfaces/    # 模块接口
│   │   │   │   └── Abstracts/     # AbstractSubmodule, AbstractModel, AbstractService
│   │   │   └── Capabilities/      # Capabilities.cs (ICan* 接口) + CapabilityExtensions.cs (扩展方法)
│   │   ├── Event/                 # MiniEventBus, MiniEvent<T>, AutoRemoveListenerHandle
│   │   ├── Observable/           # ObservableValue<T>, IReadOnlyObservableValue<T>
│   │   ├── Locator/              # GenericLocator<T>, IGenericLocator<T>
│   │   └── Utilities/            # PlayerLoopUtility
│   ├── Component/                # MonoBehaviour 组件（依赖 MonoBehaviour）
│   │   ├── Common/
│   │   │   ├── AesirArchitecture.cs       # 框架 MonoBehaviour 单例入口
│   │   │   └── AesirMonoBehaviour.cs      # Odin 自动适配基类
│   │   ├── Core/
│   │   │   ├── AesirView.cs              # Odin 适配 View 基类
│   │   │   ├── MonoView.cs               # 纯 MonoBehaviour View 基类
│   │   │   └── AesirViewController.cs    # View + Controller 双角色基类
│   │   ├── Event/
│   │   │   ├── RemoveListenerTrigger.cs  # 自动移除监听触发器基类
│   │   │   ├── RemoveListenerOnDestroyTrigger.cs
│   │   │   ├── RemoveListenerOnDisableTrigger.cs
│   │   │   ├── RemoveListenerOnSceneUnloadedTrigger.cs
│   │   │   └── RemoveListenerExtensions.cs
│   │   └── ScriptableObject/
│   │       └── AesirScriptableObject.cs  # Odin 自动适配 SO 基类
│   └── OdinIntergration/         # 独立程序集（依赖 Odin Inspector）
│       └── Runestone.AesirArchitecture.OdinIntegration.asmdef
├── Editor/
│   ├── Runestone.AesirArchitecture.Editor.asmdef
│   ├── Common/
│   │   └── EnsureAesirArchitectureDefine.cs  # 编译符号管理
│   ├── Utilities/
│   │   └── ScriptingSymbolUtility.cs
│   └── OdinIntegration/          # Odin Inspector 集成（可选）
│       └── Runestone.AesirArchitecture.Editor.OdinIntegration.asmdef
├── Tests/
│   ├── Runtime/
│   │   └── Runestone.AesirArchitecture.Tests.asmdef
│   └── Editor/
│       └── Runestone.AesirArchitecture.Tests.Editor.asmdef
├── Samples~/                    # MVC / MVP / ObservableValue / MiniEvent 演示
└── Documentation~/              # 主手册 / Books / FAQ / Manuals / Rules
```
