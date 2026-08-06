# `MonoLifecycleProxyExtensions`

## 介绍

- 种类: `static class`
- 所在程序集: `Runestone.AesirArchitecture`
- 所在命名空间: `Runestone.AesirArchitecture`

``` csharp
[Extension]
public static class MonoLifecycleProxyExtensions
```

### 注释

- Mono 生命周期事件扩展方法集合。

## 方法

### 所有方法签名总览

| 方法完整签名 |
| :--- | 
| `public Type GetType()` |
| `public virtual bool Equals(object obj)` |
| `public virtual int GetHashCode()` |
| `public virtual string ToString()` |
| `[Overload] [Ext] public static AutoRemoveListenerHandle RegisterCustomLifecycle(this GameObject go, MonoLifecycleEvent evt, Action callback, int order = 0)` |
| `[Overload] [Ext] public static AutoRemoveListenerHandle RegisterCustomLifecycle(this MonoBehaviour mono, MonoLifecycleEvent evt, Action callback, int order = 0)` |
| `[Overload] [Ext] public static AutoRemoveListenerHandle RegisterCustomLifecycle(this object obj)` |
| `[Ext] public static void RegisterCustomLifecycle(this MonoBehaviour mono)` |
| `[Overload] [Ext] public static void UnregisterCustomLifecycle(this GameObject go, MonoLifecycleEvent evt, Action callback)` |
| `[Overload] [Ext] public static void UnregisterCustomLifecycle(this MonoBehaviour mono, MonoLifecycleEvent evt, Action callback)` |
| `protected object MemberwiseClone()` |
| `protected virtual void Finalize()` |

### 声明的普通方法

| 普通方法名称 | 注释 |
| :--- | :--- | 
| `[Ext] public static AutoRemoveListenerHandle RegisterCustomLifecycle` | 添加生命周期事件监听。 |
| `[Ext] public static AutoRemoveListenerHandle RegisterCustomLifecycle` | 添加生命周期事件监听。 |
| `[Ext] public static AutoRemoveListenerHandle RegisterCustomLifecycle` | 快捷注册（任意对象）。扫描实现的所有 ICustomXXX 接口， 将对应方法自动注册到匹配的生命周期事件中。 |
| `[Ext] public static void RegisterCustomLifecycle` | 快捷注册（MonoBehaviour 专用）。扫描实现的所有 ICustomXXX 接口， 将对应方法自动注册到匹配的生命周期事件中，并在 GameObject 销毁时自动取消订阅。 |
| `[Ext] public static void UnregisterCustomLifecycle` | 移除生命周期事件监听。 |
| `[Ext] public static void UnregisterCustomLifecycle` | 移除生命周期事件监听。 |

### 继承的普通方法

| 普通方法名称 | 注释 | 声明方法的类 |
| :--- | :--- | :--- |
| `public Type GetType` |  | `System.Object` |
| `public virtual bool Equals` |  | `System.Object` |
| `public virtual int GetHashCode` |  | `System.Object` |
| `public virtual string ToString` |  | `System.Object` |
| `protected object MemberwiseClone` |  | `System.Object` |
| `protected virtual void Finalize` |  | `System.Object` |

## Additional Notes

> 首个 `## Additional Notes` 是增量生成文档标识符，请勿修改标题级别和内容！本文档由 [`Aesir Inspector`](https://github.com/yuumixcode/Unity-Aesir-Packages) 辅助生成。
