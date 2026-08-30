# Feel 插件 Rotation Spring 配置

> 基于 Feel (MoreMountains Feedbacks) 插件的 MMF_RotationSpring 反馈组件
>
> 适用版本：Feel for Unity 2022+

## 一句话总结

**Bump 是踹多狠，Damping 是力量衰减的速度（越大停得越快），Frequency 是每次来回摆动的速度（越大摆得越快）。**

---

## 快速上手

Rotation Spring 是 Feel 插件中的一个 Feedback 组件，它使用**弹簧物理模拟**来驱动 GameObject 的旋转动画。与传统的 Tween（补间动画）不同，弹簧物理不需要你指定"从 A 到 B 用几秒"——你只需要给弹簧一个"推力"（Bump）或"目标"（MoveTo），弹簧会按照物理规律自然振荡、衰减、停止。

这种方式的优点是：动画有**真实的物理感**——过冲、回弹、振荡都是自然产生的，不需要手调曲线。

### 三个核心参数

| 参数 | 一句话理解 | 范围 |
|------|-----------|------|
| **Bump** | 踹多狠——冲量大小，值越大转得越多 | 视效果而定，轻微摇晃 1000~3000，重击 5000~10000 |
| **Damping** | 刹车力度——值越大越快停下，越小弹越多 | 0.01 ~ 1 |
| **Frequency** | 摆动速度——值越大振荡越急促，越低越柔和 | 通常 1 ~ 10 |

### 三种驱动模式

| 模式 | 行为 | 典型场景 |
|------|------|---------|
| **Bump** | 给弹簧一个瞬时冲量，振荡后回到原位 | 受击摇晃、点击反馈、法杖轻晃 |
| **MoveTo** | 设置目标角度，弹簧振荡过去并停在那里 | 法杖转到指定角度、门打开到 90° |
| **MoveToAdditive** | 在当前目标上叠加增量，向新目标振荡 | 连续点击时旋转角度累加 |

**MoveTo vs Bump 的区别**：MoveTo 改变的是弹簧的"平衡点"（TargetValue），弹簧最终会停在新位置；Bump 只给一个瞬时速度，弹簧最终回到出发点。你可以把 Bump 想象成"弹一下"——像敲了一下音叉，振动完就恢复原状。

---

## 自然语言调参指南

### 各参数的直观感受

**Damping（阻尼比，0.01 ~ 1）**：

- **→ 0.01**：几乎不衰减，弹簧会振荡很久很久才停。像没有阻力的钟摆，来回摆几十下。
- **→ 1.0**：临界阻尼，不产生任何振荡，直接平滑到达目标。像在蜂蜜里移动——没有弹跳。
- **= 0.4（默认）**：中等阻尼，会有 2~4 次明显的振荡然后停止。最常用的"有弹性但不拖沓"的范围。

**Frequency（频率，Hz）**：

- **= 1~2**：慢悠悠的摆动，像挂着的粗绳索在晃。每次完整的来回需要 0.5~1 秒。
- **= 6（默认）**：比较快的弹跳，像弹簧门的回弹。每次来回约 0.17 秒。
- **= 10+**：急促的高频振动，像手机震动或音叉。肉眼几乎看清单次数振荡。

**Bump 值（冲量范围）**：

Bump 值是施加给弹簧的**速度冲量**，不是最终旋转角度。**Bump 值通常需要比你期望的旋转角度大得多**——如果你想要 10° 的摇晃效果，Bump 值设 10 是不够的，你得到的结果可能不到 1°。

### "我想要轻微的摇晃效果"

比如法杖被轻碰了一下，晃两下就停：

| 参数 | 建议值 | 理由 |
|------|--------|------|
| Mode | Bump | 晃完回到原位 |
| Bump Z Min | 1000 | 轻微摇晃的下限 |
| Bump Z Max | 3000 | 轻微摇晃的上限，有随机变化 |
| Frequency Z | 2~3 | 慢一点更柔和 |
| Damping Z | 0.5~0.7 | 2~3 次振荡就收 |

### "我想要强烈的受击旋转"

比如角色被重击，旋转好几圈再恢复：

| 参数 | 建议值 | 理由 |
|------|--------|------|
| Mode | Bump | 旋转完回到原位 |
| Bump Z Min | 5000 | 重击冲量下限 |
| Bump Z Max | 10000 | 重击冲量上限，转好几圈 |
| Frequency Z | 5~8 | 快速急促的旋转 |
| Damping Z | 0.3~0.4 | 低阻尼，弹很多次 |

### "我想要平滑旋转到某个角度"

比如门从 0° 打开到 90°：

| 参数 | 建议值 | 理由 |
|------|--------|------|
| Mode | MoveTo | 停在目标角度 |
| MoveToRotationMin/Max Z | 90, 90 | 固定转到 90° |
| Frequency Z | 2~3 | 不急不缓 |
| Damping Z | 0.7~0.9 | 几乎不弹，直接到位 |

### "我想要弹性开门效果"

门打开时先超过 90° 再弹回来：

| 参数 | 建议值 | 理由 |
|------|--------|------|
| Mode | MoveTo | 停在目标角度 |
| MoveToRotationMin/Max Z | 90, 90 | 目标 90° |
| Frequency Z | 3~4 | 中等振荡速度 |
| Damping Z | 0.2~0.3 | 低阻尼，明显过冲 |

### "弹簧振荡太久停不下来"

→ **调高 Damping**（向 1 靠拢）

### "弹簧几乎不动，看不到效果"

→ 检查以下几项：
1. **Bump 值是否太小？** Bump 值是速度冲量而非角度，需要比期望角度大得多
2. **Frequency 是否太高？** 高频率会"吃掉"冲量——峰值与频率成反比
3. **编辑器帧率是否正常？**（见下文[性能陷阱](#performance-pitfalls)章节）

### "每次旋转角度一样，想要随机变化"

→ Bump 模式下，设置 Min ≠ Max 即可。每次播放时在范围内随机取值：
```
BumpRotationMin Z = 1000
BumpRotationMax Z = 3000
// 每次播放随机取 1000~3000 之间的值
```

### "只想 Z 轴转，X/Y 不要动"

→ BumpRotationMin/Max 的 X 和 Y 都设为 0：
```
BumpRotationMin = (0, 0, 1000)
BumpRotationMax  = (0, 0, 3000)
```

---

## 参数详解

在 Inspector 中，Rotation Spring 的参数分为四个区块：

| 区块 | 参数 | 作用 |
|------|------|------|
| **Target** | AnimateRotationTarget | 要旋转的对象（Transform） |
| | DeclaredDuration | 声明时长（给 Player 调度用，不控制弹簧物理） |
| | RotationSpace | Self（局部旋转）/ World（世界旋转） |
| **Spring Settings** | Damping X/Y/Z | 阻尼比（0.01~1），控制衰减快慢 |
| | Frequency X/Y/Z | 频率（Hz），控制振荡速度 |
| **Spring Mode** | Mode | MoveTo / MoveToAdditive / Bump |
| | BumpRotationMin/Max | Bump 模式下的冲量范围 |
| | MoveToRotationMin/Max | MoveTo 模式下的目标角度范围 |

### DeclaredDuration（声明时长）

这是最容易误解的参数。它**不控制弹簧的物理持续时间**。弹簧什么时候停止完全由 Damping 和 Frequency 决定。

DeclaredDuration 的实际作用：

- **给 MMF_Player 的调度系统看**——Player 按这个值计算整个 Feedback 序列的时长和各条 Feedback 的衔接时间
- **编辑器显示**——Inspector 顶部显示的时长标签
- **生命周期管理**——Player 认为这条 Feedback 在 DeclaredDuration 秒后"播完了"

如果实际弹簧持续时间 > DeclaredDuration（低阻尼弹簧很容易超过），Player 会在声明时长结束后认为该反馈已完成，但弹簧可能还在视觉上振荡。这在大多数场景下无害，但如果你的逻辑依赖"弹簧已静止"来判断状态，就可能出问题。

---

## 代码原理

> 以下内容适合想要深入理解弹簧物理实现细节的开发者阅读。

### 弹簧物理公式

Feel 的弹簧使用经典的**阻尼谐振子方程**：

```
加速度 = -ω² × (当前值 - 目标值) - 2ζω × 速度
```

其中：
- `ω = 2π × Frequency`（角频率）
- `ζ = Damping`（阻尼比）

每帧更新：
```
速度 += 加速度 × deltaTime
当前值 += 速度 × deltaTime
```

在源码中的对应实现（`MMMaths.SpringVelocity`）：

```csharp
frequency = frequency * 2f * Mathf.PI;  // Hz → 角频率 ω
float f2 = frequency * frequency;             // ω²
float d2 = 2.0f * damping * frequency;        // 2ζω（阻尼项）
float x = currentValue - targetValue;         // 偏离平衡点的位移
float acceleration = -f2 * x - d2 * velocity; // 弹簧加速度
velocity += deltaTime * acceleration;
```

阻尼比在公式中对应 `2 × damping × ω` 这一项，直接控制每步速度衰减的幅度。

### 固定步长子步进

Feel 的 Spring 函数会把 deltaTime 拆成 1/60 秒的小步来计算，保证物理稳定性：

```csharp
public static void Spring(ref float currentValue, float targetValue, 
    ref float velocity, float damping, float frequency, float deltaTime)
{
    float fixedDeltaTime = 1.0f / 60.0f;
    float accumulator = deltaTime;
    while (accumulator > 0f)
    {
        float step = Mathf.Min(accumulator, fixedDeltaTime);
        velocity = SpringVelocity(currentValue, targetValue, velocity, 
                                   damping, frequency, step);
        currentValue += step * velocity;
        accumulator -= step;
    }
}
```

这意味着如果某一帧的 deltaTime 很大（比如 0.5 秒），弹簧会在一帧内跑 30 个物理步——相当于"快进"了 0.5 秒的物理模拟。

### Bump 的实现

Bump 非常简单——直接设置速度：

```csharp
// MMSpringFloat.cs
public override void Bump(float bumpAmount)
{
    Velocity += bumpAmount;
}

// MMF_RotationSpring.cs - CustomPlayFeedback
case Modes.Bump:
    _velocity.z = Random.Range(BumpRotationMin.z, BumpRotationMax.z);
    break;
```

注意：在 MMF_RotationSpring 中 Bump 是**赋值**（`=`）而非**叠加**（`+=`），所以重复 Bump 同一个弹簧不会累积速度——每次 Bump 都会重置速度。但 MoveTo 模式下 TargetValue 会叠加。

### 协程驱动

弹簧通过协程逐帧更新：

```csharp
protected virtual IEnumerator Spring()
{
    IsPlaying = true;
    UpdateSpring();           // 立即执行一次（不等下一帧）
    while (!LowVelocity)      // 速度低于阈值时停止
    {
        yield return null;    // 等一帧
        UpdateSpring();
        ApplyValue();         // 把值写到 Transform
    }
    _velocity = Vector3.zero; // 清零
    _currentValue = _targetValue;
    ApplyValue();
}
```

`LowVelocity` 的判断条件是三个轴速度绝对值之和小于 0.001。这意味着弹簧会一直运行直到几乎完全静止。

---

## X/Y/Z 三轴独立配置

Rotation Spring 支持每个轴单独设置 Damping 和 Frequency：

```csharp
public float DampingX = 0.4f;
public float FrequencyX = 6f;
public float DampingY = 0.4f;
public float FrequencyY = 6f;
public float DampingZ = 0.4f;
public float FrequencyZ = 6f;
```

底层通过三个独立的 MMSpringFloat 实例分别计算：

```csharp
public override void UpdateSpringValue(float deltaTime)
{
    SpringX.UpdateSpringValue(deltaTime);
    SpringY.UpdateSpringValue(deltaTime);
    SpringZ.UpdateSpringValue(deltaTime);
}
```

这意味着你可以让 Z 轴快速振荡、X 轴缓慢摇摆，各轴完全独立。如果你只需要一个轴旋转，把另外两个轴的 BumpRotationMin/Max 都设为 0 即可。

---

## Timing 与 TimescaleMode

Rotation Spring 的 `Timing` 配置决定了它使用哪种 deltaTime：

| TimescaleMode | deltaTime 来源 | 适用场景 |
|---------------|----------------|---------|
| Scaled | `Time.deltaTime` | 正常游戏时间，受 `Time.timeScale` 影响 |
| Unscaled | `Time.unscaledDeltaTime` | 不受 timeScale 影响，适合暂停界面、加载页面 |

**重要**：如果你的游戏在加载页面将 `Time.timeScale = 0`，而弹簧使用 Scaled 模式，deltaTime = 0，弹簧将完全不更新。加载页面的弹簧动画必须使用 **Unscaled** 模式。

在 MMF_Player 层面也可以统一设置：

```csharp
player.PlayerTimescaleMode = MMFeedbackTiming.TimescaleModes.Unscaled;
```

---

## 性能陷阱 {#performance-pitfalls}

### 现象

设置了 Bump 2000°，但旋转变化不到 1°，仿佛弹簧根本没生效。

### 原因

Spring 函数使用 `FeedbackDeltaTime`（通常等于 `Time.deltaTime` 或 `Time.unscaledDeltaTime`）作为步进时长。如果编辑器帧率很低（比如 2~3 FPS），deltaTime 会达到 0.3~0.5 秒。

Spring 会把这个大 deltaTime 拆成 1/60 秒的小步循环计算——0.5 秒会被拆成 30 个物理步。30 步足够让弹簧从初始冲量完全衰减到接近静止。

结果：**弹簧在第一帧内就跑完了整个动画，你什么都没看到。**

### 排查方法

在 Play Mode 下检查：
```csharp
Debug.Log($"deltaTime: {Time.deltaTime}, unscaledDeltaTime: {Time.unscaledDeltaTime}");
```

如果 deltaTime 远大于 0.0167（60fps 对应值），说明帧率有问题。

### 解决方案

1. **检查编辑器性能**：关闭不必要的 Editor 窗口、减少 Scene 中的对象数量
2. **Time.maximumDeltaTime**：Unity 默认钳制 deltaTime 到 0.3333 秒，可以适当调低
3. **实际游戏通常不会有此问题**：构建后的游戏运行在 60+ FPS，deltaTime ≈ 0.0167，弹簧会正常逐帧更新

---

## 速查表

### 参数与效果的对应关系

| 你想要的效果 | 调整方向 |
|-------------|---------|
| 更多次振荡 | ↓ Damping |
| 更快停止 | ↑ Damping |
| 更快的振荡速度 | ↑ Frequency |
| 更慢更柔和的摆动 | ↓ Frequency |
| 更大的旋转角度 | ↑ Bump 值 |
| 随机化每次旋转幅度 | 设置 Bump Min ≠ Max |
| 只在某个轴旋转 | 其他轴 Bump 设 0 |
| 弹簧最终停在新角度 | 用 MoveTo 模式 |
| 弹簧最终回到原位 | 用 Bump 模式 |
| 不受 timeScale 影响 | TimescaleMode = Unscaled |

### 常用参数预设

| 场景 | Mode | Bump/MoveTo Z | Damping Z | Frequency Z |
|------|------|---------------|-----------|-------------|
| 法杖轻晃 | Bump | 1000~3000 | 0.5~0.7 | 2~3 |
| 点击弹跳反馈 | Bump | 2000~5000 | 0.4~0.5 | 4~6 |
| 受击摇晃 | Bump | 5000~10000 | 0.3~0.4 | 5~8 |
| 平滑开门 | MoveTo | 90° | 0.7~0.9 | 2~3 |
| 弹性开门 | MoveTo | 90° | 0.2~0.3 | 3~4 |
| UI 元素入场摆动 | MoveToAdditive | 10~20° | 0.4~0.6 | 3~5 |
