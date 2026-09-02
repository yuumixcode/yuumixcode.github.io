# Reflex 视频笔记(轻量 Unity DI 框架)

> 来源:YouTube 视频 [Finally, a Unity Dependency Injection Framework That Just Works](https://www.youtube.com/watch?v=6bJmEnpxVoI)(@git-amend / Adam Myhre)
> 配套仓库:[gustavopsantos/Reflex](https://github.com/gustavopsantos/Reflex)(MIT)
>
> **定位说明**:Reflex 是一个轻量、高性能的开源 Unity DI 框架,作者 Gustavo Santos。它**不是顶级商业插件**(对比 Odin Inspector 那种级别的完整方案),也**不是 Unity 官方收录的包**。如果项目已经在用 Zenject / VContainer / Extenject / UniDi,不必为了它迁移;但如果想要一个"快、轻、AOT 友好"的最小可用方案,值得放进候选名单。

---

## 一句话总结

Reflex 是 Unity 上一款**主打"快+轻+AOT 友好"**的依赖注入容器。设计上对标 Zenject / VContainer,目标是在这两者已经很轻的基础上进一步缩减运行时代价,同时把 IL2CPP / WebGL 兼容性做成默认行为。

---

## 视频内容摘要

### 视频定位

- **频道**:git-amend(Adam Myhre,Unity Insider / Certified Unity Professional Programmer)
- **主题**:不是讲"什么是 DI",而是直接上手展示一个**在 Unity 里能直接跑起来**的 DI 框架(Reflex)。视频标题强调 "Finally... that just works",基调是"对比已有方案,这一个不容易踩坑"。
- **形式**:实操演示 + 逐步说明。无前置理论铺垫。

### 视频章节(约 13 分钟)

| 时间戳 | 章节 | 讲了什么 |
|--------|------|---------|
| `0:00` | Setup | 安装 Reflex 包 + 新建空场景 + 搭一个最小可运行的 "Hello" 例子 |
| `6:30` | Singleton Dependencies | 单例生命周期的注册与注入 |
| `9:20` | Transient and Scoped Dependencies | 瞬时(每次新建)与作用域(SceneScope / ProjectScope)绑定 |
| `10:33` | Properties, Methods and Manual Resolution | 属性注入、方法注入、运行时手动从容器解析 |

### 视频传递的核心观点

1. **不要重复造 DI 轮子** — Unity 圈 DI 选择已经很多(Zenject / VContainer / Extenject / UniDi / USyrup),与其从头写,不如选一个维护活跃、社区成熟的方案。
2. **Reflex 的卖点** — 在已有方案里属于"性能 + 体积"最激进的那一档;同时把 Unity 最容易翻车的两个点(AOT 编译、WebGL)作为一等公民处理。
3. **上手成本** — 视频演示下来,基础用法(ProjectScope + SceneScope + `[Inject]`)与 VContainer 的 API 形态很接近,从 VContainer 迁过来几乎零学习成本。

---

## 开源仓库:[gustavopsantos/Reflex](https://github.com/gustavopsantos/Reflex)

### 基本信息

| 项 | 值 |
|---|---|
| 仓库 | [github.com/gustavopsantos/Reflex](https://github.com/gustavopsantos/Reflex) |
| 作者 | Gustavo Santos(@gustavopsantos) |
| Slogan | "Blazing fast, minimal but complete dependency injection library for Unity" |
| License | MIT |
| 当前版本 | 13.x(13.0.2 / 13.0.3,2025-10 释出) |
| Star / Fork | 1.6k+ / 116+(截至 2026) |
| UPM 包名 | `com.gustavopsantos.reflex` |

### 性能定位(官方数据)

- **速度**:Resolve 比 VContainer 快最多 414%,比 Zenject 快最多 800%
- **GC 分配**:比 VContainer 少最多 28%,比 Zenject 少最多 921%
- **AOT 友好**:基本没有运行时 `Emit`,在 IL2CPP / WebGL / iOS / 主机平台都能跑
- **不可变容器**:线程安全、无锁、可预期

> 这些是仓库自述数据,选型时建议自己跑一次自己的业务场景的 benchmark 再下结论。

### 安装(三种方式)

```text
方式 1:UPM(Git URL)
  https://github.com/gustavopsantos/reflex.git?path=/Assets/Reflex/#13.0.2

方式 2:OpenUPM
  openupm add com.gustavopsantos.reflex

方式 3:.unitypackage
  从 Releases 页面下载,直接拖进 Unity
```

### 核心 API 速览(与 README 同步)

```csharp
using Reflex.Core;
using UnityEngine;

// 1) ProjectInstaller:在 ProjectScope 上注册全局绑定
public class ProjectInstaller : MonoBehaviour, IInstaller
{
    public void InstallBindings(ContainerBuilder builder)
    {
        builder.AddSingleton("Hello");
    }
}

// 2) SceneInstaller:在 SceneScope 上注册场景级绑定
public class GreetInstaller : MonoBehaviour, IInstaller
{
    public void InstallBindings(ContainerBuilder builder)
    {
        builder.AddSingleton("World");
    }
}

// 3) 注入到 MonoBehaviour
using Reflex.Attributes;
public class Greeter : MonoBehaviour
{
    [Inject] private readonly IEnumerable<string> _strings;

    private void Start()
    {
        Debug.Log(string.Join(" ", _strings));  // "Hello World"
    }
}
```

### 关键概念(视频里用到的)

| 概念 | 作用 | 类比 |
|------|------|------|
| **ProjectScope** | 全局唯一,Application 生命周期内复用 | 整个游戏的"根"容器 |
| **SceneScope** | 每个 Scene 一个,Scene 卸载时随容器一起销毁 | 场景级 DI 边界 |
| **IInstaller** | 实现 `InstallBindings(ContainerBuilder)`,声明绑定 | Zenject 的 Installer |
| **IStartable** | 容器构建完成后立即构造,提供 `Start()` 钩子 | 类似 VContainer 的 `IStartable` |
| **[Inject]** | MonoBehaviour 上的字段/属性/方法注入标记 | Zenject 的 `[Inject]` |
| **ContainerBuilder** | 绑定描述符,声明"谁是谁、什么生命周期" | 写法很像 VContainer |

### 平台兼容性

- iOS / Android / Windows / Mac / Linux
- PS4 / PS5 / Xbox One / Xbox Series X|S
- WebGL(IL2CPP 验证)
- 没有运行时 `Emit` → 不会撞 AOT 编译坑

### 适用场景 / 不适用场景

| 适合 | 不适合 |
|------|--------|
| 新项目从零开始,需要 DI 但不想用 Zenject 那么"重" | 已有项目深度依赖 Zenject 的特性(SubContainer、Decorator、Convention 绑定等高级玩法) |
| 移动端 / WebGL / 主机平台对 GC 敏感 | 想要社区最庞大、stackoverflow 答案最多的方案(Zenject 仍占优势) |
| 团队规模小,只需要"单例 + 场景级 + 构造注入"这一档基础功能 | 需要复杂 Decorator / OpenGeneric / 装饰器模式等高级特性(Reflex 这块覆盖比 Zenject 薄) |

---

## 与其他 Unity DI 方案的横向对比

> 选型时只列"项目方自己公开的指标",不带主观推荐。

| 框架 | 协议 / 来源 | 特点 | 适合 |
|------|------------|------|------|
| **Zenject** | MIT / Modest Tree | 行业老大哥,功能最全,生态最大 | 大型项目,需要 SubContainer、Decorator、Convention 绑定 |
| **Extenject** | MIT / Zenject fork | 维护更活跃的 Zenject 分支 | 想要 Zenject 全部特性但修一些上游 bug |
| **UniDi** | Apache 2.0 | Extenject 的重构版,模块化拆分 | 想要参与共建、模块化定制 |
| **VContainer** | MIT | 性能强、API 现代、上手快 | 性能敏感且不想折腾 Zenject 的项目 |
| **Reflex** | MIT | 极轻、AOT 友好、Resolve 速度与 GC 表现最好 | 新项目、对 GC 和 AOT 敏感、API 够用即可 |
| **USyrup** | MIT | 小巧,接口清晰 | 学习用 / 超小型项目 |

---

## 我对这条信息的归档定位

> 这是我从 YouTube 视频里**偶然看到**的一个 DI 仓库,不是我现在主推或正在使用的方案,所以这里**只是存档**:
>
> - **不打算现在就整合到 Aesir / 个人项目主线**(我们已有自己的解耦思路)
> - 不放进 `Plugins` 顶级分类(它不属于 Odin / Feel 那种重量级)
> - 但作为"Unity DI 选型时的一个轻量备选"留在知识库,以后有需要能快速找到
> - 等真的用上,再独立写一篇实战笔记,而不是这一篇"视频摘要"

---

## 参考链接

- 视频: [Finally, a Unity Dependency Injection Framework That Just Works(YouTube)](https://www.youtube.com/watch?v=6bJmEnpxVoI)
- 视频作者频道: [@git-amend(Adam Myhre)](https://www.youtube.com/@git-amend)
- 仓库: [gustavopsantos/Reflex(GitHub)](https://github.com/gustavopsantos/Reflex)
- OpenUPM 列表: [com.gustavopsantos.reflex](https://openupm.com/packages/com.gustavopsantos.reflex/)
- 同一作者的另一部相关视频: [Build Your Own Dependency Injection in less than 15 Minutes \| Unity C#(YouTube)](https://www.youtube.com/watch?v=PJcBJ60C970)(手写一个最小 DI 框架,理解原理用)
- 同作者讲的 SOLID 之 D: [D in SOLID - I wish I learned the LAST letter FIRST(YouTube)](https://www.youtube.com/watch?v=JSqE4C7ZZos)
