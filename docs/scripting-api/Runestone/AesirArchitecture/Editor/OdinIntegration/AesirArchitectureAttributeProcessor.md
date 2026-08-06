# `AesirArchitectureAttributeProcessor`

## 介绍

- 种类: `class`
- 所在程序集: `Runestone.AesirArchitecture.Editor.OdinIntegration`
- 所在命名空间: `Runestone.AesirArchitecture.Editor.OdinIntegration`

``` csharp
public class AesirArchitectureAttributeProcessor : Sirenix.OdinInspector.Editor.OdinAttributeProcessor<AesirArchitecture>, 
Sirenix.Utilities.Editor.IHideObjectMembers
```

### 注释

- 为 AesirArchitecture 类提供 Odin Inspector 属性处理器

## 构造方法

| 构造方法签名 [仅包含公共实例方法] | 注释 |
| :--- | :--- |
| `public AesirArchitectureAttributeProcessor()` |  |

## 方法

### 所有方法签名总览

| 方法完整签名 |
| :--- | 
| `public Type GetType()` |
| `public override void ProcessSelfAttributes(InspectorProperty property, List<Attribute> attributes)` |
| `public virtual bool CanProcessChildMemberAttributes(InspectorProperty parentProperty, MemberInfo member)` |
| `public virtual bool CanProcessSelfAttributes(InspectorProperty property)` |
| `public virtual bool Equals(object obj)` |
| `public virtual int GetHashCode()` |
| `public virtual string ToString()` |
| `public virtual void ProcessChildMemberAttributes(InspectorProperty parentProperty, MemberInfo member, List<Attribute> attributes)` |
| `protected object MemberwiseClone()` |
| `protected virtual void Finalize()` |

### 继承的普通方法

| 普通方法名称 | 注释 | 声明方法的类 |
| :--- | :--- | :--- |
| `public Type GetType` |  | `System.Object` |
| `public override void ProcessSelfAttributes` | 处理类自身的特性，添加描述信息框 | `Runestone.AesirArchitecture.Editor.OdinIntegration.AesirArchitectureAttributeProcessor` |
| `public virtual bool CanProcessChildMemberAttributes` |  | `Sirenix.OdinInspector.Editor.OdinAttributeProcessor` |
| `public virtual bool CanProcessSelfAttributes` |  | `Sirenix.OdinInspector.Editor.OdinAttributeProcessor` |
| `public virtual bool Equals` |  | `System.Object` |
| `public virtual int GetHashCode` |  | `System.Object` |
| `public virtual string ToString` |  | `System.Object` |
| `public virtual void ProcessChildMemberAttributes` |  | `Sirenix.OdinInspector.Editor.OdinAttributeProcessor` |
| `protected object MemberwiseClone` |  | `System.Object` |
| `protected virtual void Finalize` |  | `System.Object` |

## Additional Notes

> 首个 `## Additional Notes` 是增量生成文档标识符，请勿修改标题级别和内容！本文档由 [`Aesir Inspector`](https://github.com/yuumixcode/Unity-Aesir-Packages) 辅助生成。
