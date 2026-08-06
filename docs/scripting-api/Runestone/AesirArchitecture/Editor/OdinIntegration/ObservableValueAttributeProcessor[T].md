# `ObservableValueAttributeProcessor<T>`

## 介绍

- 种类: `class`
- 所在程序集: `Runestone.AesirArchitecture.Editor.OdinIntegration`
- 所在命名空间: `Runestone.AesirArchitecture.Editor.OdinIntegration`

``` csharp
public class ObservableValueAttributeProcessor<T> : Sirenix.OdinInspector.Editor.OdinAttributeProcessor<ObservableValue<T>>, 
Sirenix.Utilities.Editor.IHideObjectMembers 
```

### 注释

- 为泛型 ObservableValue 提供的 Odin Inspector 属性处理器，用于优化其在面板上的展示效果。

## 构造方法

| 构造方法签名 [仅包含公共实例方法] | 注释 |
| :--- | :--- |
| `public ObservableValueAttributeProcessor<T>()` |  |

## 方法

### 所有方法签名总览

| 方法完整签名 |
| :--- | 
| `public Type GetType()` |
| `public override void ProcessChildMemberAttributes(InspectorProperty parentProperty, MemberInfo member, List<Attribute> attributes)` |
| `public override void ProcessSelfAttributes(InspectorProperty property, List<Attribute> attributes)` |
| `public virtual bool CanProcessChildMemberAttributes(InspectorProperty parentProperty, MemberInfo member)` |
| `public virtual bool CanProcessSelfAttributes(InspectorProperty property)` |
| `public virtual bool Equals(object obj)` |
| `public virtual int GetHashCode()` |
| `public virtual string ToString()` |
| `protected object MemberwiseClone()` |
| `protected virtual void Finalize()` |

### 继承的普通方法

| 普通方法名称 | 注释 | 声明方法的类 |
| :--- | :--- | :--- |
| `public Type GetType` |  | `System.Object` |
| `public override void ProcessChildMemberAttributes` | 处理子成员特性，当值在 Inspector 中被修改时自动触发变更通知事件 | `Runestone.AesirArchitecture.Editor.OdinIntegration.ObservableValueAttributeProcessor`1[T]` |
| `public override void ProcessSelfAttributes` | 处理类自身的特性，隐藏标签并使其内联展示 | `Runestone.AesirArchitecture.Editor.OdinIntegration.ObservableValueAttributeProcessor`1[T]` |
| `public virtual bool CanProcessChildMemberAttributes` |  | `Sirenix.OdinInspector.Editor.OdinAttributeProcessor` |
| `public virtual bool CanProcessSelfAttributes` |  | `Sirenix.OdinInspector.Editor.OdinAttributeProcessor` |
| `public virtual bool Equals` |  | `System.Object` |
| `public virtual int GetHashCode` |  | `System.Object` |
| `public virtual string ToString` |  | `System.Object` |
| `protected object MemberwiseClone` |  | `System.Object` |
| `protected virtual void Finalize` |  | `System.Object` |

## Additional Notes

> 首个 `## Additional Notes` 是增量生成文档标识符，请勿修改标题级别和内容！本文档由 [`Aesir Inspector`](https://github.com/yuumixcode/Unity-Aesir-Packages) 辅助生成。
