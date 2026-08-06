# `AesirArchitectureLifecyclePhase`

## 介绍

- 种类: `enum`
- 所在程序集: `Runestone.AesirArchitecture`
- 所在命名空间: `Runestone.AesirArchitecture`

``` csharp
public enum AesirArchitectureLifecyclePhase : System.Enum, 
System.IFormattable, 
System.IComparable, 
System.IConvertible
```

### 注释

- 游戏级生命周期阶段，对应 PlayerLoop 子系统插入点

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
| `public const AesirArchitectureLifecyclePhase AfterUpdate;` | 逻辑帧结束：在 PlayerLoop.PostLateUpdate 之后执行，读取当前帧所有状态 |
| `public const AesirArchitectureLifecyclePhase BeforeUpdate;` | 逻辑帧开始：在 PlayerLoop.Update 之前执行，架构优先运算 |

## Additional Notes

> 首个 `## Additional Notes` 是增量生成文档标识符，请勿修改标题级别和内容！本文档由 [`Aesir Inspector`](https://github.com/yuumixcode/Unity-Aesir-Packages) 辅助生成。
