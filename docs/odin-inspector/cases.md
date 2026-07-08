# 实战案例

## 案例一：OdinInterfaceReference（序列化接口引用）

设计：自定义 `OdinInterfaceReference<TInterface, TObject>` 存「实现特定接口的对象」；自定义 Drawer 支持拖拽选择 + 验证圆点；`[OdinRequiredInterface]` 限定类型。

```csharp
[Serializable]
public class OdinInterfaceReference<TInterface, TObject>
    where TInterface : class where TObject : UnityEngine.Object
{
    [SerializeField] TObject underlyingObject;
    public TObject UnderlyingObject { get => underlyingObject; set => underlyingObject = value; }
    public TInterface InterfaceValue => underlyingObject as TInterface;  // 类型安全取值
}
// 简化版：OdinInterfaceReference<TInterface> : OdinInterfaceReference<TInterface, Object>
```

> 序列化的 `underlyingObject` 不走 Get/Set 验证，故隐藏它、自定义绘制引用并验证，同时维持序列化以落盘。
> 完整 Drawer 见「自定义 Drawer」板块的 `OdinInterfaceReferenceDrawer` 示例。

## 案例二：MultiLanguageButtonAttribute（多语言按钮）

`Processor` 动态加 `ButtonAttribute` → `Drawer` 在 `Initialize()` 用解析字符串改 `Name` 实现实时切换（见坑点 2）。

## 案例三：配合 SerializeReference

```csharp
[SerializeReference] public BaseInspector odinDraw = new DerivedInspector();        // 面板可改类型
[DrawWithUnity, SerializeReference] public BaseInspector unityDraw = new OtherInspector(); // 需改代码
```

## 案例四：插件结构设计

放弃 Package Manager（导入后只读，ScriptableObject 实例无法自定义修改），**采用 Plugins 文件夹插件式**存储（与 Odin 同结构，折叠即可）。
