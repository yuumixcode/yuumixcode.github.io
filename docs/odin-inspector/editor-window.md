# 编辑器窗口

## OdinEditorWindow

- **不要重写 `OnGUI`**；注入 GUI 请重写 `DrawEditors` 或用 `[OnInspectorGUI]` 特性。
- 必须重写 `OnGUI` 时务必 `base.OnGUI()`，否则只剩普通 EditorWindow。
- Odin **默认开启 ScrollView**。

### 绘制优先级顺序

```
OnBeginDrawEditors → [特性变量] → [OnInspectorGUI 方法] → DrawEditors → OnEndDrawEditors
```
> `OnBeginDrawEditors` / `DrawEditors` / `OnEndDrawEditors` 都必须写 `base.`，否则不按序或覆盖。

## OdinMenuItem

可自定义单个菜单项（含默认打开宽度）；示例见 `Assets/Plugins/Sirenix/Demos/Editor Windows/Scripts/Editor/OdinMenuStyleExample.cs`。

## 内置工具类一览

| 类 | 作用 |
| --- | --- |
| `SirenixEditorGUI` | 绘制编辑器 GUI（对标 `EditorGUI`/`GUILayout`） |
| `SirenixEditorFields` | 字段绘制（对标 `EditorGUI`） |
| `SirenixGUIStyles` | 封装样式（对标 `GUIStyle`） |
| `GUIHelper` / `GUIContext` | GUI 工具集 |
| `ObjectPicker` | Object 选择器 |
| `DragAndDropUtility` | 拖拽辅助 |
| `PathUtilities` | 路径工具（对标 `EditorUtility`） |
| `OdinEditorResources` | 取 Odin Logo |

## 常用 API

```csharp
GUIHelper.RequestRepaint();              // 请求重绘（实时刷新）
InspectorConfig.Instance;                // 强制重绘配置
serializedObject.ApplyModifiedProperties();  // 面板修改后保存
```

## SirenixGUIStyles

```csharp
GUILayout.Label(label, SirenixGUIStyles.Label, GUILayoutOptions.Height(22f));
GUILayout.Label(text, SirenixGUIStyles.HighlightedLabel, GUILayoutOptions.Height(22f));
SirenixEditorGUI.DrawRoundRect(rect, SirenixGUIStyles.GreenValidColor, radius);
GUILayoutOptions.Height(22f).MinWidth(14).MaxWidth(22f);   // 链式调用
```

> **原则**：尽量用 Odin 特性而非 Unity 特性；Odin 绘制中优先用 Odin 封装功能。
