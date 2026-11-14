# USyrup 仓库笔记(Guice 风格 Unity DI 框架)

> 仓库:[Jeffan207/usyrup](https://github.com/Jeffan207/usyrup)(MIT)
> 作者:Jeffan207
>
> **定位说明**:USyrup 是一个**运行时**依赖注入框架,设计上 heavily inspired by Java 的 Guice / Dagger。它的核心卖点不是功能全,而是**简单**——作者明确说只实现了最基础的 DI 特性,目标是让 DI" approachable "而不是制造依赖 confusion。如果项目需要 Zenject / VContainer / Reflex 那种级别的完整方案,USyrup 不是对手;但如果想**学习 DI 框架的设计思路**,或者给超小型项目配一个够用就行的容器,它值得一看。

---

## 一句话总结

USyrup 把 Guice 的语义搬进了 Unity:**SyrupModule(模块)+ `[Provides]`(显式提供)+ `[Inject]`(构造/成员注入)+ SyrupComponent(场景里的容器载体)**,场景加载时自动构建并校验依赖图,然后注入所有带 `[Inject]` 成员的 MonoBehaviour。

---

## 基本信息

| 项 | 值 |
|---|---|
| 仓库 | [github.com/Jeffan207/usyrup](https://github.com/Jeffan207/usyrup) |
| 作者 | Jeffan207 |
| Slogan | "A runtime dependency injection framework for the Unity Game Engine" |
| License | MIT |
| Star / Fork | 44 / 2(截至 2026-09) |
| Commits | 38(体量很小,源码集中在一个 `SyrupSource/` 目录) |
| 灵感来源 | Java Guice / Dagger(语义对齐,食物系命名致敬 Guice) |
| 安装方式 | OpenUPM / UPM Git URL / Releases tarball / Unity Asset Store |

---

## 工作原理(三步)

1. 写 **SyrupModule**(继承 `SyrupModule` 的 MonoBehaviour),用 `[Provides]` 方法显式声明依赖;
2. 场景里建一个空物体,挂 **SyrupComponent** + 你的 SyrupModule;
3. Play —— SyrupComponent 在 `Awake()` 读模块、构建并**校验**依赖图,在 `Start()` 注入场景里所有带 `[Inject]` 成员的 MonoBehaviour。

依赖图构建时会做 **validation**:缺依赖直接报 `MissingDependency`,而不是运行到一半才炸。

## 快速上手

```csharp
// 1) 要注入的 MonoBehaviour:写个 [Inject] 方法,参数就是依赖
public class Breakfast : MonoBehaviour {

    private Pancakes pancakes;

    [Inject]
    public void Init(Pancakes pancakes) {
        this.pancakes = pancakes;
    }
}

// 2) 场景模块:继承 SyrupModule,[Provides] 方法按返回值类型提供依赖
public class ExampleSyrupModule : SyrupModule {
    [Provides]
    public Pancakes ProvidesPancakes(TastySyrup tastySyrup) {
        return new Pancakes(tastySyrup);
    }

    [Provides]
    public TastySyrup ProvidesTastySyrup() {
        return new TastySyrup();
    }
}

// 3) 空物体挂 SyrupComponent + ExampleSyrupModule,Play 即可
```

---

## 核心特性速览

### SyrupModule(模块)

- 模块是继承 `SyrupModule` 的 MonoBehaviour,挂在 SyrupComponent **同一个 GameObject** 上;
- 一个 SyrupComponent 可以吃任意多个模块,模块之间也能互相提供依赖,鼓励把大模块拆小;
- `[Provides]` 方法(Provider 方法)按**返回值类型**注册依赖;Provider 方法的参数本身也由容器解析,可以形成 Provider 层级;
- 没标 `[Singleton]` 的 Provider,**每次请求都新建实例**。

### `[Named]`(同类型消歧)

同一类型有多个 Provider 时会产生歧义注入,用 `[Named("xxx")]` 消歧——Provider 端和注入端都要标:

```csharp
[Provides]
public Breakfast ProvidesBobsBreakfast([Named("ScrambledEggs")] EggDish eggDish) { ... }

[Provides]
[Named("ScrambledEggs")]
public EggDish ProvidesScrambledEggs() { ... }
```

`[Named]` 也能用在构造注入的参数上。

### `[Inject]` 的两种形态

| 形态 | 用途 | 说明 |
|------|------|------|
| **构造注入** | 普通 C# 类 | 标 `[Inject]` 的构造函数会被容器自动发现并纳入依赖图,不必在模块里显式声明 Provider |
| **成员注入**(字段/属性/方法) | MonoBehaviour / 构造注入后补步骤 | 只进不出——注入的依赖**不会回流**到依赖图,是单向关系 |

MonoBehaviour 无法走构造函数,所以靠 `[Inject]` 字段/属性/方法注入。**注入顺序固定**:字段 → 属性 → 方法;继承体系里**基类先于派生类**(基类字段 → 子类字段 → 基类方法 → 子类方法),派生类可以安全使用基类已注入的依赖。

属性注入会走 setter,可以在 setter 里写校验逻辑,提前暴露坏值。

### `[Singleton]`

- 标在 Provider 方法或类上,容器**只创建一次**并缓存,所有注入点共享同一实例;
- Singleton 在**依赖图首次校验时**就创建并缓存(不是首次请求时);
- 如果类上标了 `[Singleton]` 但被模块里的 Provider 覆盖了,以 Provider 为准——类上的标记被忽略,除非 Provider 方法也标。

### 声明式绑定(Declarative Bindings)

模块可重写 `Configure(IBinder)`,用流式 API 替代啰嗦的 Provider 方法,最典型的用法是**抽象绑具体**:

```csharp
public class ExampleSyrupModule : SyrupModule {
    public void Configure(IBinder binder) {
        binder.Bind<Pancake>().To<BlueberryPancake>().Named("FunPancakes").AsSingleton();
        binder.Bind<Pancake>().ToInstance(pancake);   // 也可以直接绑已有实例
        binder.Bind<BlueberryPancake>();              // 自绑定(配合 enableAutomaticConstructorSelection)
        binder.Bind<Pancake, BlueberryPancake>();     // Bind<T>().To<U>() 的简写
    }
}
```

好处:被绑的具体类仍然能走成员注入(Provider 方法则需要手动 new、手动填参数,MonoBehaviour 场景下根本没法 new)。

### `[SceneInjection(enabled: false)]`

默认所有 MonoBehaviour 都会在场景加载时被注入。标 `[SceneInjection(enabled: false)]` 可跳过——适用于**运行时动态创建**的对象,或改用按需注入的对象。

### LazyObject 容器(延迟构造)

注入点把类型包成 `LazyObject<T>`,容器**现在注入、用时才构造**,适合构造开销大的依赖:

```csharp
[Inject]
[Named("Maple")]
LazyObject<TastySyrup> syrup;   // Provider 端不用改,包装由 SyrupInjector 在注入时完成

public void PourSyrup() {
    TastySyrup s = syrup.Get(); // 第一次 Get 才真正构造,之后缓存
}
```

注意:虽然支持 `new LazyObject<T>()` 直接构造,但会失去图校验保护(缺依赖推迟到运行时才抛 `MissingDependencyException`),且容器本身不再是 Singleton——官方不推荐,除非有明确理由。

### SyrupComponent 可调参数

| 参数 | 类型 | 作用 |
|------|------|------|
| Scenes To Inject | `List<string>` | 只注入指定场景(additive 加载时防重复注入);不设置则注入所有已加载场景 |
| Use Scene Injection | bool | 关掉后完全不做事前注入(不用逐个标 `[SceneInjection(false)]`) |
| Verbose Logging | bool | 容器日志详细程度 |
| Inject in Awake | bool | 把场景注入从 `Start()` 提前到 `Awake()` |
| Enable Automatic Constructor Selection | bool | 声明式绑定允许自动选无参构造(即使没标 `[Inject]`),仅限声明式绑定 |

### SyrupInjector(按需注入)

SyrupInjector 是 SyrupComponent 内部真正的容器(单例,场景切换时随 `OnDestroy` 销毁,依赖跨场景重建)。两种手动用法:

```csharp
// 直接取实例(含命名版本)
TastySyrup syrup = SyrupComponent.SyrupInjector.GetInstance<TastySyrup>();
Milk milk = SyrupComponent.SyrupInjector.GetInstance<Milk>("LactoseFreeMilk");

// 对运行时创建的对象做按需成员注入
SyrupComponent.SyrupInjector.Inject(this);
```

---

## 注意事项(Caveats)

- **时序**:默认 `Awake()` 建图、`Start()` 注入。所以 MonoBehaviour 里**别在 `Awake()` 用注入来的依赖**,最早也要等 `Start()`;
- SyrupComponent 的默认 Script Execution Order 是 **-900**,保证它先于普通脚本跑;
- `Awake()` 里可以按需注入,但对方对象自己的 `Awake()` 可能还没跑,注入来的 MonoBehaviour 未必完全初始化;
- 也可以脱离 SyrupComponent 直接 `new SyrupInjector(modules...)`,立即注入——但在 MonoBehaviour/Unity 语境下基本不实用。

## 适用场景 / 不适用场景

| 适合 | 不适合 |
|------|--------|
| 想读源码学习"一个 DI 容器怎么实现"(代码量小,语义对齐 Guice) | 中大型项目需要 SubContainer / Decorator / OpenGeneric 等高级特性 |
| 超小型项目,只需要"模块 + 注入 + 单例"这一档基础功能 | 对 GC / 启动性能敏感(作者自嘲 "probably isn't the fastest DI framework out there",syrup 很黏) |
| 喜欢 Guice/Dagger 语义、从 Java 转 Unity 的开发者 | 需要 AOT / IL2CPP 明确保证的场景(仓库没有相关数据) |

## 我对这条信息的归档定位

> 这是调研 Unity DI 生态时踩点的一个**小众仓库**(44 star,对比 Reflex 1.6k+),只是存档:
>
> - **不打算整合到 Aesir / 个人项目主线**(已有自己的解耦思路)
> - 价值主要在**学习**——它的模块 + Provider + 图校验结构,是理解 Guice 系 DI 设计的最小样本
> - 同目录的 [Reflex 视频笔记](reflex-video-note.md)里已把它列入横向对比表,本文是补档细节

---

## 参考链接

- 仓库: [Jeffan207/usyrup(GitHub)](https://github.com/Jeffan207/usyrup)
- 灵感来源: [Google Guice](https://github.com/google/guice) / [Dagger](https://dagger.dev/)
- 同目录对比笔记: [Reflex 视频笔记](reflex-video-note.md)
