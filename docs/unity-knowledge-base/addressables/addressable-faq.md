# Addressables Package 问题清单

## 使用 Label 批量加载时，会加载对应资源所在的 AB 包吗？

会的。使用 `LoadAssetsAsync` 并按 Label 批量加载时，Addressables 系统会自动完成以下步骤：

1. 查找所有匹配该 Label 的资源。
2. 分析这些资源分别属于哪些 AssetBundle。
3. 自动加载（必要时自动下载远程包）对应的 AssetBundle。
4. 从已加载的 AB 包中加载目标资源。

整个过程对调用方透明——你不需要手动指定或预先加载对应的 AB 包，Addressables 会自动处理依赖关系和包的加载。

---

## `LiberationSans SDF.asset` 已经在 Resources 文件夹中存在，被 Addressable 系统管理，我还需要手动设置 Addressable 的 Asset 路径吗？

**不需要手动设置路径**，但需要注意一个关键问题。

### 默认行为

当你将一个资源标记为 Addressable 时，Unity 会自动为它分配一个默认地址（通常是资源在项目中的路径，例如 `Assets/Resources/LiberationSans SDF.asset`）。这个默认地址可以直接用于 `LoadAssetAsync`，无需额外配置。

### 重要：Resources 文件夹与 Addressables 的冲突

Addressables 系统在构建时会**显式跳过** `Resources` 文件夹中的资源，避免同一资源被重复打包（一份在 Resources 构建产物中，一份在 Addressables 的 AB 包中）。

这意味着：
- 如果你希望该资源由 Addressables 管理，**需要将它移出 `Resources` 文件夹**，否则它不会被包含在 Addressables 构建中。
- `Resources` 和 Addressables 是两套独立的资源管理系统，不建议混用。

### 推荐做法

1. 将 `LiberationSans SDF.asset` 从 `Resources` 文件夹移到其他位置（如 `Assets/AddressableAssets/`）。
2. 在 Addressables Groups 窗口中确认该资源已正确分组。
3. 默认地址无需手动修改，除非你需要更简洁的加载路径（例如改为 `"Fonts/LiberationSans"`）。

### 作为字体资产的回退时，还需要移出来吗？

**需要，仍然要移出来。** 资源是否作为回退字体，并不会改变 Addressables 对 `Resources` 文件夹的处理规则。

原因：

- TMP 字体资产的回退列表（`Fallback Font Asset Table`）存储的是**直接的 `TMP_FontAsset` 引用**，而不是地址。
- 当主字体资产通过 Addressables 加载时，Unity 会尝试解析并加载其序列化依赖（包括回退字体）。
- 但 `LiberationSans SDF.asset` 在 `Resources` 文件夹中，Addressables 构建会跳过它，因此它**不会被打进任何 AB 包**。
- 结果：主字体资产在运行时通过 Addressables 加载后，其回退引用会变成 **null**，回退字体无法生效。

所以，要让回退关系在 Addressables 流程下正确工作，必须把 `LiberationSans SDF.asset` 移出 `Resources` 并标记为 Addressable，使其成为主字体资产的打包依赖。

> 替代方案：如果你只是想保留 `LiberationSans SDF` 作为 TMP 的全局默认字体（而非某个字体的具体回退），可以把它留在 `Resources` 中，并改用 **TMP Settings 的 `Default Font Asset`** 配置，而不是在字体资产里以序列化引用方式挂为回退。但这种方式下它不会经过 Addressables 管理。
