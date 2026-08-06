# `EnsureAesirArchitectureDefine`

## 介绍

- 种类: `static class`
- 所在程序集: `Runestone.AesirArchitecture.Editor`
- 所在命名空间: `Runestone.AesirArchitecture.Editor`

``` csharp
[InitializeOnLoad]
internal static class EnsureAesirArchitectureDefine
```

### 注释

- 自动确保 AESIR_ARCHITECTURE 脚本宏定义符号存在。 通过 InitializeOnLoadAttribute 在编辑器加载时自动执行， 供 Aesir 系列其他插件通过 #if AESIR_ARCHITECTURE 检测本架构是否存在。

## 方法

### 所有方法签名总览

| 方法完整签名 |
| :--- | 
| `public Type GetType()` |
| `public virtual bool Equals(object obj)` |
| `public virtual int GetHashCode()` |
| `public virtual string ToString()` |
| `protected object MemberwiseClone()` |
| `protected virtual void Finalize()` |

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
