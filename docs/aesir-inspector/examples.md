# 使用示例

本页给出 Aesir Inspector 最短可运行示例，展示双语特性 `[BilingualTitle]` 与 `[BilingualButton]` 的配合（需要安装 Odin Inspector 以启用双语装饰器）。

```csharp
using RunLab.AesirInspector;
using Sirenix.OdinInspector;
using UnityEngine;

public class ExampleMonoBehaviour : MonoBehaviour
{
    [BilingualTitle("玩家属性", "Player Stats")]
    [SerializeField]
    private int health;

    [BilingualButton("重置属性", "Reset Stats")]
    private void ResetStats()
    {
        health = 100;
    }
}
```

## 说明

- `[BilingualTitle("玩家属性", "Player Stats")]`：在 Inspector 中同时显示中文标题「玩家属性」与英文 `Player Stats`。
- `[BilingualButton("重置属性", "Reset Stats")]`：生成一个双语标签的按钮，点击调用 `ResetStats()`。
- 若未安装 Odin Inspector，核心程序集仍可编译运行，但双语装饰器不会生效——此时这些特性会被桥接层安全忽略。

> 更多双语控件（如 `[BilingualInfoBox]`、`[BilingualText]`、各类 Control）见 [双语 UI 与 Odin 桥接](bilingual-odin.md)。
