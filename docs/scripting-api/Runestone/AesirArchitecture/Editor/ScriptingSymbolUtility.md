# `ScriptingSymbolUtility`

## 介绍

- 种类: `static class`
- 所在程序集: `Runestone.AesirArchitecture.Editor`
- 所在命名空间: `Runestone.AesirArchitecture.Editor`

``` csharp
public static class ScriptingSymbolUtility
```

### 注释

- 脚本宏定义工具，用于管理 PlayerSettings 中的 Scripting Define Symbols。 参考 Odin Inspector 的 EnsureOdinInspectorDefine 实现， 遍历所有构建目标（排除 Unknown 和 Dedicated Server），提供幂等的宏定义符号添加/移除能力。

## 方法

### 所有方法签名总览

| 方法完整签名 |
| :--- | 
| `public Type GetType()` |
| `public virtual bool Equals(object obj)` |
| `public virtual int GetHashCode()` |
| `public virtual string ToString()` |
| `public static bool HasScriptingDefineSymbol(string symbol)` |
| `public static void EnsureScriptingDefineSymbol(string symbol)` |
| `public static void RemoveScriptingDefineSymbol(string symbol)` |
| `protected object MemberwiseClone()` |
| `protected virtual void Finalize()` |

### 声明的普通方法

| 普通方法名称 | 注释 |
| :--- | :--- | 
| `public static bool HasScriptingDefineSymbol` | 检查指定的宏定义符号是否已存在于当前构建目标中。 |
| `public static void EnsureScriptingDefineSymbol` | 确保指定的宏定义符号存在于所有有效构建目标中（排除 Unknown 和 Dedicated Server）。若已存在则不重复添加。 |
| `public static void RemoveScriptingDefineSymbol` | 确保指定的宏定义符号不存在于所有有效构建目标中。若不存在则不做任何操作。 |

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
