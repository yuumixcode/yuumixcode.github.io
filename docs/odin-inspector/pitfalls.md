# 坑点速查

## 八大坑点

1. **OdinEditor 接管致自定义 Editor 失效**：导入 Odin 后脚本 Inspector 继承 `OdinEditor`。解决：自定义「具体到某个类」的 `[CustomEditor(typeof(X), false)] : OdinEditor`；或在 `Preference - Editor Types` 关覆盖（改后点 `Update Editors`）。
2. **多语言按钮无法实时切换**：`Button.Name` 在 `Initialize()` 生成 `ValueResolver`，`DrawPropertyLayout` 不刷新 → 必须用解析字符串 `"@Manager.IsChinese ? \"中\" : \"En\""`。
3. **Odin 序列化无传递性**：间接继承无效 → 用 `[NonSerialized, OdinSerialize]` 强制。
4. **数组/列表 label 为 null**：集合类型默认舍弃 Label → `if (label != null)` 判断。
5. **字符串被裁切**：两侧留空格 `" [x] "`。
6. **TabGroup 层级冲突**：只能做子层级，不能与其他 Group 顶层共存。
7. **DrawEditors 须调 base**：否则覆盖全部绘制（`OnBegin/OnEndDrawEditors` 同理）。
8. **OdinSerialize 双重序列化**：只加 `[OdinSerialize]` 会被 Unity+Odin 双序列化 → 配 `[NonSerialized]`。

## 快速检查清单

- [ ] 自定义 Drawer 泛型约束是否正确？
- [ ] `DrawPropertyLayout` 中是否判断 `label != null`？
- [ ] 需 `CallNextDrawer` 处是否已调用？
- [ ] 改 `Preference - Editor Types` 后是否点 `Update Editors`？
- [ ] 序列化基类是否**直接**继承（非间接）？
- [ ] `[OdinSerialize]` 是否同时加了 `[NonSerialized]`？
- [ ] `DrawEditors` 重写是否调了 `base`？
