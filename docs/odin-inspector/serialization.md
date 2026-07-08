# 序列化系统

## 核心原则

Odin **不覆盖** Unity 序列化，只是**扩展**它；一个类可同时拥有 Unity 与 Odin 序列化字段。
> Odin 强大的序列化**只有在直接实现时**才生效。

## SerializedMonoBehaviour 系列（直接继承即开启 Odin 序列化）

| 类名 | 说明 |
| --- | --- |
| `SerializedMonoBehaviour` | 最常用 |
| `SerializedBehaviour` / `SerializedComponent` | 行为 / 组件 |
| `SerializedScriptableObject` | ScriptableObject |
| `SerializedNetworkBehaviour` | 网络行为 |
| `SerializedStateMachineBehaviour` | 状态机行为 |
| `SerializedUnityObject` | Unity 对象 |

> ⚠️ **无传递性**：`Second : First`，`First : SerializedMonoBehaviour`，`Second` **不会**继承 Odin 序列化——只有直接继承才有效。

## 字段序列化

```csharp
[SerializeField] private int myField;          // Unity 序列化（新版推荐）
// 新版 Odin 官方不再建议 [OdinSerialize]，改用 [SerializeField]
```

## 强制使用 Odin 序列化

非 Odin 基类类型中，用 `[NonSerialized]` + `[OdinSerialize]` 组合强制：

```csharp
// 错误：只加 [OdinSerialize]，Unity 与 Odin 会双重序列化同一字段 → 数据冗余/细微错误
// 正确：阻止 Unity，交给 Odin
[NonSerialized, OdinSerialize]
public Dictionary<string, int> myDictionary;
```

## 自定义实现 Odin 序列化器

无法继承基类时，实现 `ISerializationCallbackReceiver` + `UnitySerializationUtility`：

```csharp
[ShowOdinSerializedPropertiesInInspector]
public class CustomSerializedScriptableObject : ScriptableObject, ISerializationCallbackReceiver
{
    [SerializeField, HideInInspector] private SerializationData serializationData;
    void ISerializationCallbackReceiver.OnAfterDeserialize() =>
        UnitySerializationUtility.DeserializeUnityObject(this, ref this.serializationData);
    void ISerializationCallbackReceiver.OnBeforeSerialize() =>
        UnitySerializationUtility.SerializeUnityObject(this, ref this.serializationData);
}
```

## OdinEditor 接管规则

- `Preference - Editor Types` 可看被 OdinEditor 覆盖绘制的类型。
- ⚠️ **只有「具体到某个类」的自定义绘制**才能阻止 OdinEditor 默认覆盖；自定义父类的绘制再让子类继承，仍会被 OdinEditor 覆盖。
- 每次修改后必须点 **`Update Editors`** 才生效。

## Unity 序列化基础

- Unity 序列化作用于**字段**而非属性（属性只是字段的包装器）。
- **Inspector 优先级高于字段初始化**：反序列化在对象生成后给字段赋值。
- `[SerializeReference]` 三种用途：同一实例多引用 / **多态（抽象类或基类存储，重点）** / 序列化 null。

```csharp
[SerializeReference] public BaseInspector odinDraw = new DerivedInspector();   // Odin Draw：面板可改类型
[DrawWithUnity, SerializeReference] public BaseInspector unityDraw = new OtherInspector(); // Unity 原生：需改代码 Reset
```

## 序列化相关特性

| 特性 | 作用 |
| --- | --- |
| `[ShowOdinSerializedPropertiesInInspector]` | Inspector 显示 Odin 序列化字段 |
| `[OdinSerialize]` | 强制 Odin 序列化（配 `[NonSerialized]`） |
| `[DrawWithUnity]` | 强制 Unity 原生绘制某字段 |

> 💡 仅存简单数据到 JSON，用 Unity 自带 `JsonUtility`（比 Odin JSON 快得多）；Odin 二进制极快，JSON 慢。
