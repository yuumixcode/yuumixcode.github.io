# `MonoLifecycleEvent`

## 介绍

- 种类: `enum`
- 所在程序集: `Runestone.AesirArchitecture`
- 所在命名空间: `Runestone.AesirArchitecture`

``` csharp
public enum MonoLifecycleEvent : System.Enum, 
System.IFormattable, 
System.IComparable, 
System.IConvertible
```

### 注释

- Mono 生命周期事件类型，涵盖 Unity 原生生命周期回调和自定义 PlayerLoop 阶段。

## 方法

### 所有方法签名总览

| 方法完整签名 |
| :--- | 
| `public Type GetType()` |
| `public bool HasFlag(Enum flag)` |
| `public override bool Equals(object obj)` |
| `public override int GetHashCode()` |
| `public override string ToString()` |
| `public string ToString(string format)` |
| `public virtual TypeCode GetTypeCode()` |
| `public virtual int CompareTo(object target)` |
| `protected object MemberwiseClone()` |
| `protected virtual void Finalize()` |
| `[Overload] public virtual string ToString(IFormatProvider provider)` |
| `[Overload] public virtual string ToString(string format, IFormatProvider provider)` |

### 继承的普通方法

| 普通方法名称 | 注释 | 声明方法的类 |
| :--- | :--- | :--- |
| `public Type GetType` |  | `System.Object` |
| `public bool HasFlag` |  | `System.Enum` |
| `public override bool Equals` |  | `System.Enum` |
| `public override int GetHashCode` |  | `System.Enum` |
| `public override string ToString` |  | `System.Enum` |
| `public string ToString` |  | `System.Enum` |
| `public virtual TypeCode GetTypeCode` |  | `System.Enum` |
| `public virtual int CompareTo` |  | `System.Enum` |
| `protected object MemberwiseClone` |  | `System.Object` |
| `protected virtual void Finalize` |  | `System.Object` |
| `public virtual string ToString` |  | `System.Enum` |
| `public virtual string ToString` |  | `System.Enum` |

## 字段

### 常量字段

| 字段完整签名 | 注释 |
| :--- | :--- |
| `public const MonoLifecycleEvent AfterUpdate;` | 自定义 PlayerLoop 阶段：在 PostLateUpdate 之后执行 |
| `public const MonoLifecycleEvent BeforeUpdate;` | 自定义 PlayerLoop 阶段：在 Update 之前执行 |
| `public const MonoLifecycleEvent FixedUpdate;` | MonoBehaviour.FixedUpdate — 物理帧 |
| `public const MonoLifecycleEvent LateUpdate;` | MonoBehaviour.LateUpdate — 每帧后处理 |
| `public const MonoLifecycleEvent OnApplicationFocus;` | MonoBehaviour.OnApplicationFocus — 应用获得或失去焦点 |
| `public const MonoLifecycleEvent OnApplicationPause;` | MonoBehaviour.OnApplicationPause — 应用被系统暂停或恢复 |
| `public const MonoLifecycleEvent OnApplicationQuit;` | MonoBehaviour.OnApplicationQuit — 应用退出 |
| `public const MonoLifecycleEvent Update;` | MonoBehaviour.Update — 每帧逻辑更新 |

## Additional Notes

> 首个 `## Additional Notes` 是增量生成文档标识符，请勿修改标题级别和内容！本文档由 [`Aesir Inspector`](https://github.com/yuumixcode/Unity-Aesir-Packages) 辅助生成。
