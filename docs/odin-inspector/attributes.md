# Attributes 特性

## ShowInInspector — 调试用，不序列化

仅显示，不写入文件；编辑态改的值**不影响 Play 模式**；运行时实时刷新值，适合调试。

```csharp
[ShowInInspector] int _test = 1;   // 编辑态改 111，运行时仍 = 1
```

## ShowDrawerChain — 调试 Drawer 流程

显示属性绘制过程；灰色 Drawer = 被同级覆盖（非跳过）。

### 三个优先级（Drawer 链）

1. **SuperPriority**：包裹整个属性但不绘制本身，调 `CallNextDrawer()`。
2. **WrapperPriority**：装饰属性。
3. **ValuePriority**：`OdinValueDrawer<T>` / `OdinAttributeDrawer<...>` 使用，**只能有一个在绘制**，多余覆盖；Unity 原生优先级最低。

> 值类型有 3 个要点；引用类型有 5 个要点。`float` 的 Drawer 叫 `SingleDrawer`（特殊）。

## MultiLineProperty — 多行文本

| 特性 | 来源 | 行数 | 自动扩展 | 支持范围 |
| --- | --- | --- | --- | --- |
| `TextArea(min,max)` | Unity | 最小/最大 | 是 | 字段 |
| `Multiline(n)` | Unity | 精确 | 否 | 字段 |
| `MultiLineProperty(n)` | Odin | 精确 | 否 | 字段/属性/方法参数/类型 |

```csharp
[ShowInInspector, MultiLineProperty(10)] public string OdinProp { get; set; }  // Odin 支持属性
```

## OnInspectorInit / OnInspectorDispose

- `OnInspectorInit`：打开面板时执行（懒加载，折叠态展开才初始化）。
- `OnInspectorDispose`：关闭面板 / GC / 属性变更旧数据处理时触发。

## HorizontalGroup — 水平分组

```csharp
[HorizontalGroup("Group", 0.5f)] public int Left;
[HorizontalGroup("Group")]     public int Right;
```

- 0~1 视为百分比；宽度为 0 自动调列宽；默认按 1/Count 均分。
- Button **只设高度**，宽度用 `HorizontalGroup` 或 `ButtonGroup` 控制。

## TabGroup — 分页组

⚠️ 层级独立，**只能在其他 Group 的子层级**；与 `TitleGroup` / `ButtonGroup` / `HorizontalGroup` **顶层冲突**，不能传给它们。

## TitleAttribute / ButtonAttribute

- `TitleAttribute`：优先级 `[DrawerPriority(1.0)]`（Super 级），绘完标题需 `CallNextDrawer(label)`。
- `ButtonAttribute` 继承 `ShowInInspectorAttribute`，由 `DefaultMethodDrawer` 绘制（针对方法）。

## Group 使用原则

Odin Group 有层级，从外往内写；一个变量带多个互斥属性会**独立绘制两次**。
