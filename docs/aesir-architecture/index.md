# Aesir Architecture

> 面向团结引擎 / Unity 的渐进式 MVP 架构框架，以 Unity 原生特性为一等公民。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/yuumixcode/aesir-architecture/blob/main/LICENSE.md)
[![Version](https://img.shields.io/badge/version-0.3.2-blue.svg)](https://github.com/yuumixcode/aesir-architecture/blob/main/CHANGELOG.md)
[![Unity](https://img.shields.io/badge/Unity-2022.3%2B-black.svg)](https://unity.com/)

GitHub 仓库：<https://github.com/yuumixcode/aesir-architecture>

## 概述

**AesirArchitecture（RAA）** 是一个以 **Unity 原生优先** 为核心理念的架构框架。它不构建与引擎平行的自建体系，而是深度绑定 Unity 的 PlayerLoop、ScriptableObject、Editor API 等原生能力，在保持轻量的同时为中小型到中大型项目提供清晰的 MVP / MVC 分层。

## 核心特性

- **PlayerLoop 原生生命周期** — 通过 `AesirArchitectureLifeCycle` 将自定义子系统注入 Unity PlayerLoop，提供 `BeforeUpdate` / `AfterUpdate` 帧回调，无需 MonoBehaviour。
- **能力接口组合** — 通过 `ICanGetModel`、`ICanExecuteCommand`、`ICanAddListener` 等能力标记接口组合出 `IModel` / `IService` / `IView` / `IController` / `IPresenter`，按需暴露能力。
- **命令模式** — `ICommand` / `IAsyncCommand` 负责写操作，支持同步与异步。
- **ObservableValue 响应式属性** — Model 持有可写实例，View 通过 `IReadOnlyObservableValue<out T>` 协变只读访问，保障层级安全。
- **MiniEventBus 类型事件总线** — 按事件类型注册/发布，支持自动移除监听句柄与多种生命周期绑定（GameObject 销毁、场景卸载等）。
- **运行时错误日志** — `GetModel<T>()` / `GetService<T>()` 在目标未注册时抛出含调用者类型和目标类型信息的异常，替代前置依赖校验，兼容运行时替换 Model 的调试模式。
- **AbstractSubmodule 统一子模块生命周期** — Model 和 Service 的公共生命周期逻辑提取到 `AbstractSubmodule` 基类，消除代码重复。
- **GenericLocator 泛型定位器** — 按类型注册/查询的通用定位器，替代旧版 Container，支持全局单例。
- **Domain Reload 安全** — 静态变量通过 `[RuntimeInitializeOnLoadMethod]` 显式重置，反复进出 Play Mode 无残留。
- **纯 C# 核心 + MonoBehaviour 适配** — 框架核心为纯 C# 对象，Engine 层不依赖任何 Component 层类型，`AesirView<T>` / `MonoView<T>` / `AesirViewController<T>` 作为 MonoBehaviour 适配层。
- **MVC + MVP 双模式** — `IController` 适合快速开发，`IPresenter` 提供更严格的 Model-View 隔离。

## 与 QFramework 的差异

| 维度 | QFramework | AesirArchitecture |
|------|-----------|-------------------|
| 生命周期 | MonoBehaviour 事件回调 | PlayerLoop 原生注入（`BeforeUpdate` / `AfterUpdate`） |
| 架构根 | 泛型单例 `Architecture<T>` | 泛型静态单例 `AbstractContext<T>` + `GenericLocator` 全局定位 |
| 可观察属性 | `BindableProperty<T>` | `ObservableValue<T>` + `IReadOnlyObservableValue<out T>` 协变只读 |
| 事件通信 | 纯 C# TypeEvent | 纯 C# MiniEventBus + 委托（不使用 `event` 关键字） |
| 日志 | `Debug.Log` | `AesirArchitectureLog` 条件编译统一日志 |
| 静态状态 | 无 Domain Reset 保障 | `[RuntimeInitializeOnLoadMethod]` 显式重置 |
| 表现层 | 无明确抽象 | `IView` 表现层接口 + `IController` / `IPresenter` 双模式 |

> 下一步：阅读 [快速开始](quick-start.md) 用 5 步跑起第一个计数器，或查看 [架构总览](architecture.md) 理解整体分层。
