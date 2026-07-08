# 自定义 Drawer

## 基础概念

继承 `OdinValueDrawer<T>`，T 为要绘制的字段类型；可借**泛型约束**获得继承传递性。

```csharp
// 具体类 → 不绘制子类；泛型约束 where T : Weapon → 满足约束即绘制，且具传递性
public class CorrectWeaponDrawer<T> : OdinValueDrawer<T> where T : Weapon { }
```

## DrawPropertyLayout

重写此方法绘制；不调 `CallNextDrawer(label)` 则不进入下一绘制链（ValuePriority 通常只保留一个）。

```csharp
protected override void DrawPropertyLayout(GUIContent label)
{
    var v = ValueEntry.SmartValue;
    // ... 绘制逻辑
    ValueEntry.SmartValue = v;   // 结束更新
    // CallNextDrawer(label);    // 如需继续链则调用
}
```

## ValuePriority vs WrapperPriority

```csharp
// ValuePriority：替代原生，不调 CallNextDrawer 覆盖
public class OdinInterfaceReferenceDrawer<TRef, TIf, TObj> : OdinValueDrawer<TRef>
    where TRef : OdinInterfaceReference<TIf, TObj> where TIf : class where TObj : UnityEngine.Object
{
    protected override void DrawPropertyLayout(GUIContent label)
    {
        var ref = ValueEntry.SmartValue;
        if (ref.UnderlyingObject == null)
            SirenixEditorGUI.ErrorMessageBox($"请选择实现了 {typeof(TIf).Name} 的实例");
        SirenixEditorGUI.BeginHorizontalPropertyLayout(new GUIContent($"{label} [{typeof(TIf).Name}] "));
        {
            ref.UnderlyingObject = (TObj)SirenixEditorFields.UnityObjectField(
                new GUIContent(), ref.UnderlyingObject, typeof(TObj), true);
        }
        SirenixEditorGUI.EndHorizontalPropertyLayout();
        ValueEntry.SmartValue = ref;
    }
}

// WrapperPriority：装饰，通常调 CallNextDrawer
[DrawerPriority(DrawerPriorityLevel.WrapperPriority)]
public class MultiLanguageButtonAttributeDrawer : OdinAttributeDrawer<MultiLanguageButtonAttribute>
{
    protected override void Initialize()
    {
        var btn = Property.GetAttribute<ButtonAttribute>();
        // 必须在 Initialize 中用解析字符串赋值（见坑点 2）
        btn.Name = "@InspectorMultiLanguageManagerSO.IsChinese ? \"中文名\" : \"English\"";
    }
    protected override void DrawPropertyLayout(GUIContent label) => CallNextDrawer(label);
}
```

## OdinAttributeProcessor — 动态加特性

```csharp
public class MultiLanguageAttributeProcessor<T> : OdinAttributeProcessor<T> where T : class
{
    public override void ProcessChildMemberAttributes(InspectorProperty p, MemberInfo m, List<Attribute> attrs)
    {
        if (m.MemberType == MemberTypes.Method && m.GetCustomAttribute<MultiLanguageButtonAttribute>() != null)
            attrs.Add(m.GetCustomAttribute<MultiLanguageButtonAttribute>().CreateChineseButton());
    }
}
```

## 关键 API

| API | 用途 |
| --- | --- |
| `ValueEntry.SmartValue` | 读/写当前字段值 |
| `Property.GetAttribute<T>()` | 取属性上的特性 |
| `Property.TryGetTypedValueEntry<T>()` | 取类型化值入口 |
| `SirenixEditorGUI.Begin/EndHorizontalPropertyLayout` | 水平布局（含 PrefixLabel） |
| `SirenixEditorGUI.ErrorMessageBox` / `DrawRoundRect` | 错误框 / 圆角 |
| `SirenixEditorFields.UnityObjectField` | Odin 增强版引用选择框 |

## 注意事项

- **label 可能为 null**（集合类型默认舍弃 Label）→ 先 `if (label != null)` 再绘制。
- **字符串两侧留空格**，避免被裁切：`$" [{typeof(TIf).Name}] "`。
- **实时更新**必须在 `Initialize()` 中用解析字符串赋值，`if-else` 静态赋值无法切换（见坑点 2）。
