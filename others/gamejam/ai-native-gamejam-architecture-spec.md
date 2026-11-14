# AI Native Game Jam 架构规范（RAA 精简版）

> **用途**：24h Game Jam 的项目级架构规范，写给 AI 编码助手阅读并遵守；Jam 后人工接手时同样适用。
> **用法**：把本文件拷贝到 Jam 仓库根目录（命名 `AGENTS.md` / `CLAUDE.md`），即作为 AI 的最高约束。
> **基座**：Aesir Architecture（RAA）+ Aesir Modules（RAM）v0.31.2+，Unity / 团结引擎 2022.3+，uGUI。
> **安装**（UPM Git URL，两包都要加，Modules 依赖 Architecture）：
> - `https://github.com/yuumixcode/AesirFramework.git#AesirArchitecture-latest`
> - `https://github.com/yuumixcode/AesirFramework.git#AesirModules-latest`

---

## 0. 结论速览（AI 先读这张表，写代码时随时回查）

| 决策点 | 结论 |
|---|---|
| 架构模式 | RAA 渐进式 MVC：**快捷档类结构（View 兼 Controller 单类）+ 标准档 Model 暴露面（只读 + 写方法）** |
| 核心三件套 | `GameContext`（全项目唯一）→ `XxxModel`（持 `ObservableValue`）→ `XxxPanel` / `XxxWindow`（UI 兼逻辑入口） |
| UI | RAM UI 框架：`UIRoot` 四层 Canvas；HUD / 信息面板 = Panel，模态 / 全屏流转 = Window |
| 通知 | 查 §5.1 决策表，每个场景有唯一默认答案 |
| 输入 | 默认旧 Input Manager（零配置）；UI 按钮走 uGUI `onClick` |
| 程序集 | 不拆 asmdef，业务代码全进 `Assembly-CSharp` |
| 明确不做 | 事件总线、Context 多实例、Command / Query、async 架构、池化、运行时防御兜底、数据源统一、存档设计 |

## 1. 范围边界（先划界，避免越管越宽）

**本规范管**（AI 必须遵守的架构层）：

1. **UI** —— 层级、面板 / 窗口生命周期、命名与预制体结构
2. **底层逻辑** —— Context / Model / Service 的组装方式、生命周期与帧更新钩子、Domain Reload 安全
3. **交互方式** —— 玩家输入入口、模块间通知机制

**本规范不管**（业务层自由建模，AI 自行决策，无需架构级确认）：

- 数据源统一处理、存档设计与序列化格式、多存档 / 多房间建模
- 玩法规则、数值平衡、关卡数据结构
- 美术 / 音频素材的组织（AI Native 素材流程另行约定）

## 2. 为什么是 RAA（选型分析结论）

1. **三档渐进路径天然匹配「Jam → 未来扩展」**。快捷 → 标准 → 严格，每档只加一个概念，不推翻重写。24h 内用最少概念跑通闭环；Jam 后继续演进时按 §2.1 触发器逐档升级，已写代码基本不动。
2. **极简设计哲学 = AI 可预测性强**。无事件总线、无运行时防御、fail-fast（异常消息自带修复提示与近失识别）——AI 写错时编译期 / 首次运行即报错，报错文本直接给出修法，自纠错成本低。
3. **Unity 原生优先 = 人工修改友好**。不搭建与引擎平行的体系，人工接手时看到的就是标准 Unity 代码（uGUI、`Update`、`[SerializeField]`），上面只叠加一层清晰的角色边界。
4. **现成功能模块省 24h**。RAM 的 UI 框架（面板生命周期）、EventModule（解耦广播）、AudioModule（SFX / BGM）、SceneModule（场景加载）都是 Jam 必用的轮子，禁止 AI 现造重复轮子。

### 2.1 档位决策与升级触发器

**24h 内统一用**：View 兼 Controller 单类（`MonoViewController<T>` / `AesirBasePanelViewController<T>`）+ Model 只读暴露 + 写方法。禁止在 Model 写方法之外直改 `ObservableValue`（面板内部纯表现状态除外）。

**升级触发器（写成 Jam 后 TODO，24h 内禁止提前做）**：

| 触发条件 | 升级动作 |
|---|---|
| 同一 Model 的修改散落 3+ 处 | 引入 Command（写）/ Query（读）（严格档） |
| 需要多存档 / 多房间 | 在业务层建模（RAA 不做 Context 多实例） |
| 需要单元测试 / 多套 UI 主题 | Model 接口注册（严格档） |

## 3. 底层逻辑规则

### 3.1 Context（架构根，全项目唯一）

```csharp
public sealed class GameContext : AbstractContext<GameContext>
{
    protected override void Configure()
    {
        RegisterModel(new GameModel());      // 被依赖的先注册
        RegisterModel(new ScoreModel());
        RegisterService(new StageService()); // 可选
    }
}

// 首次访问 Instance 触发懒加载初始化（按注册顺序 Model → Service）
var model = GameContext.Instance.GetModel<GameModel>();
```

- 全项目**只建一个 `GameContext`**；Model / Service 数量按需，不求完整
- **铁律**：`Configure()` / `OnInitialize()` 内禁止访问 `Instance`（会递归创建第二个上下文实例）
- Register 与 Get 必须同类型参数（本规范统一用具体类，不做接口抽象）
- fail-fast：未注册类型抛含修复提示的异常——**禁止 try-catch 吞掉**，按提示修

### 3.2 Model（数据层）

```csharp
public sealed class ScoreModel : AbstractModel
{
    [SerializeField] ObservableValue<int> _score = new(0);
    public IReadOnlyObservableValue<int> Score => _score;           // 只读暴露

    public void AddScore(int points) => _score.Value += points;     // 写方法 = 唯一修改入口
    public void LoadScore(int raw)   => _score.SetValueSilently(raw); // 静默回填（初始化 / 读档）
}
```

- 需要被 UI 观察的状态一律 `ObservableValue<T>`；集合状态用 `ObservableList<T>` / `ObservableDictionary<TKey, TValue>` / `ObservableHashSet<T>`
- `SetValueSilently` 仅用于「不该触发通知」的写入（初始化 / 读档回填）
- Model 里**禁止**：`UnityEvent` 字段、uGUI 引用、读 `Input`、`GameObject.Find` / `GetComponent`、跨 Model 的玩法逻辑
- 写方法内不做跨 Model 协调——跨模块协调放 Service

### 3.3 Service（跨模块协调，按需）

- 仅当逻辑要协调 2+ 个 Model 时才建 Service；单 Model 内的逻辑直接写 Model 写方法
- Service 可直写 Model，不能执行 Command / Query（本 Jam 不用 Command / Query）

### 3.4 生命周期与帧更新

| 需求 | 默认用法 |
|---|---|
| 挂在物体上的表现逻辑 | Unity 原生 `Update` / `OnTriggerEnter2D` 等，照常写 |
| 非 MonoBehaviour 对象需要 Tick | 实现 `ICustomUpdate` 等 8 个接口之一 + `MonoLifecycleProxy.Register(this as MonoBehaviour)` |
| 无 GameObject 的游戏级帧钩子 | `AesirPlayerLoop.Register(phase, cb, order)`（销毁前必须 `Unregister`，需持有委托实例） |

- **Domain Reload 铁律**：自己写的 `static` 字段必须在 `[RuntimeInitializeOnLoadMethod(SubsystemRegistration)]` 方法里显式重置，反复进出 Play Mode 无残留
- 监听回调**不应抛异常**（`MiniEvent` 是 fail-fast 直调，一个监听者抛异常会中断后续监听者）——业务异常在回调内部自行 try-catch

### 3.5 场景

- 结构建议：`00_Bootstrap`（可选，预放置 UIRoot / AesirModules / SceneModule，保持 DDOL 开启）+ `Game`（主玩法）
- 加载 / 叠加 / 卸载用 `SceneModule`：`SceneModule.LoadSceneSingle(path, onCompleted:, onFailed:, onProgress:)` / `LoadSceneAdditive(path)` / `ReloadScene()`
- 场景广播用 `SceneModule.SceneLoadedEvent` / `SceneUnloadedEvent`（MiniEvent，句柄记得绑 `RemoveListenerWhen*`）
- **不做场景间传参**——跨场景数据用共享 Model（RAA 设计边界）
- 不要对同一路径重复 `LoadSceneAdditive`（追踪列表按路径只记一条，卸载不干净）

## 4. UI 规则

### 4.1 初始化（一次性，编辑器操作）

菜单 `GameObject → Aesir Modules → Create UIRoot` 一键生成：四层 Canvas（Background 100 / Normal 200 / Popup 300 / Top 400）+ UICamera + EventSystem。画布配置用 `UICanvasConfigSO` 默认值（1920×1080 / ScaleWithScreenSize），**不要另调**。

### 4.2 界面选型决策表（新界面先查这张表）

| 界面 | 用什么 | 挂载 / 层 |
|---|---|---|
| HUD（得分 / 血量 / 计时 / 波次） | **Panel** | Normal 层（200） |
| 并存信息面板（背包栏 / 列表） | **Panel** | Normal 层，多个并存 |
| 非模态提示（Toast / 通知） | **Panel** | Popup 层（300） |
| 暂停 / 设置 / 结算 / 胜负 | **Window**（模态） | UIRoot 直下，`Mask` 挡输入 |
| 全屏加载 / 过场 | **Window**（无 Mask） | 独立排序，恒在面板之上 |

主形态选 Panel（Jam 推荐）；Window 用于需要挡住下面一切输入、或全屏流转的界面。

### 4.3 命名与预制体结构（AI 生成代码必须一致）

- **类名 = 脚本名 = 预制体名**；面板 `XxxPanel`、窗口 `XxxWindow`（**禁止** `XxxCanvas` 命名）
- Window 预制体结构约定：

  ```
  XxxWindow          根：Canvas + CanvasScaler + GraphicRaycaster + 窗口脚本
  ├── Mask           全屏 Image（拦截其下一切射线）+ 可选 Button（承接点击）
  └── Content        实际 UI 元素容器（框架不触碰）
  ```

- 走 UIModule 的 UI 用 `AesirBasePanelViewController<T>` / `AesirBaseWindowViewController<T>`（RAM 生命周期 + RAA Controller 能力）；`MonoViewController<T>` 仅用于不进 UIModule 的临时场景 UI——同一类界面两种方式不要混用
- 预制体放 `Assets/Resources/UI/`（默认 loader 按面板类型名加载），或在 Bootstrap 里 `UIModule.RegisterPrefab<T>(prefab)` 显式注册
- 注册键 = 面板实例的实际类型：注册 / 显示 / 关闭 / 获取**统一用同一类型**

### 4.4 面板 / 窗口生命周期契约

```
实例化（停用状态，Awake/OnEnable 不触发）
  → OnInit（只调一次） → 每次显示 OnShow(payload)
  → OnHide（DestroyOnHide=false 时停用缓存，下次复用）
  → 受控销毁才走 OnClose → Destroy
```

| 职责 | 放哪 |
|---|---|
| 一次性初始化、绑定 UI 引用 | `OnInit` |
| 订阅 Model 通知、按 payload 刷新视图 | `OnShow` + 退订句柄绑 `RemoveListenerWhenGameObjectOnDisable` |
| 复用前重置视图状态 | `OnHide` |
| **事件解绑 / 订阅释放的兜底** | `OnDestroy`（`OnClose` 只在受控销毁路径调用，场景卸载 / 外部 Destroy 不触发！） |

### 4.5 UI 代码模板（照此抄）

```csharp
public class HudPanel : AesirBasePanelViewController<GameContext>
{
    [SerializeField] Text scoreText;

    protected override void OnShow(object payload)
    {
        var model = this.GetModel<GameModel>();
        model.Score.AddListenerAndInvoke(UpdateScore)            // 订阅即同步当前值
             .RemoveListenerWhenGameObjectOnDisable(gameObject); // UI 面板推荐 OnDisable 退订
    }

    void UpdateScore(int score) => scoreText.text = score.ToString();
}
```

- 显示 / 关闭：`UIModule.Show<HudPanel>()` / 面板内 `HideSelf()`；窗口 `UIModule.Open<T>()` / `Close<T>()` / `CloseSelf()`
- 面板带参：`UIModule.Show<T>(payload)` → `OnShow(payload)` 接收
- **订阅 / 退订组合自洽性**：订阅放 `OnShow` + `RemoveListenerWhenGameObjectOnDisable`（每次显示重新订阅，隐藏自动退订）；不要「订阅放 `OnInit` + OnDisable 退订」——缓存复用面板再显示时订阅已失效
- **数据流向总纲**：输入 / UI 事件 → 面板内方法 → Model 写方法 → `ObservableValue` 通知 → 订阅者刷新。**禁止**面板 A 直接引用 / 修改面板 B——走 Model 或 EventModule
- 需要美术 / 非程序员在 Inspector 接事件时：`AesirEventArgsSO` + `UnityEventOnAesirEvent` 桥接组件（零代码）

## 5. 交互方式规则

### 5.1 通知机制决策表（每个场景唯一默认答案）

| 场景 | 唯一推荐 | 例 |
|---|---|---|
| Model 状态变化通知 UI | `ObservableValue<T>` + `AddListenerAndInvoke` | 血量 / 得分 / 金币 |
| 一次性瞬时通知（无状态） | `MiniEvent` / `MiniEvent<T>` | 门开了 / 怪死了 / 波次开始 |
| 跨模块解耦广播（多订阅者 / 要过滤 / 要优先级） | `EventModule` + `AesirEventArgs` | 玩家死亡 → UI + 音频 + 生成器 |
| Inspector 拖拽连线（美术可调） | `UnityEvent`（uGUI `onClick`） | 按钮点击播音效 |
| 对象内部回调（编译期限制外部） | C# `event`（**禁止** `public Action` 字段） | — |

**反模式（AI 禁止）**：

| 反模式 | 正确做法 |
|---|---|
| `public Action Xxx { get; set; }` | `event Action Xxx;`（编译期限制外部只能 `+=` / `-=`） |
| 用 MiniEvent 承载持续变化的状态 | `ObservableValue<T>`（新订阅者拿不到当前值） |
| 用 UnityEvent 做跨模块逻辑通知 | MiniEvent / ObservableValue（Inspector 配置不可搜索 / diff） |
| Model 直接持有 UnityEvent 字段 | `ObservableValue<T>`（数据层与编辑器配置解耦） |

### 5.2 跨模块广播模板（EventModule）

```csharp
// 1. 定义：参数载体命名 XxxEventArgs : AesirEventArgs（自包含事件才命名 XxxEvent）
public class OnPlayerDied : AesirEventArgs { public int FinalScore; }

// 2. 发布（sender = 发布者）
new OnPlayerDied { FinalScore = 100 }.Invoke(this);

// 3. 订阅（Script 轨，返回的句柄必须绑定生命周期）
AutoRemoveListenerHandle _handle;
void OnEnable()  => _handle = EventModule.AddListener<OnPlayerDied>(this, OnPlayerDied);
void OnDisable() => _handle.Dispose();   // 重复调用安全
void OnPlayerDied(OnPlayerDied e) { /* ... */ }

// 或 Attribute 轨：OnEnable 里 EventModule.AddListener(this)，
// [AesirListener] 标记方法（事件类型从参数推断），OnDisable 里 EventModule.RemoveListener(this)
```

- 需要精确投递时用内建过滤器（可链式组合）：`WithTag("Enemy")` / `OnlySelf`（自身 / 子树 / 父链）/ `SameSceneAsEmitter`（多场景叠加）/ `InsideCollider2D`（空间局域）
- 优先级（First / High / Medium / Last）仅在订阅者间有明确先后依赖时声明，默认档即可

### 5.3 玩家输入

| 交互 | 默认做法 |
|---|---|
| UI 按钮 | uGUI `Button.onClick`（UnityEvent） |
| 键鼠 gameplay 输入 | 旧 Input Manager：`Input.GetKeyDown` / `Input.GetAxis`（零配置） |
| 手柄 / 按键重绑定成为明确需求 | Input System 包（UIRoot 自动替换 `InputSystemUIInputModule`）——Jam 默认不启用 |

- **输入入口统一**：gameplay 输入只在 PlayerController / InputController 类读取；UI 回调只走 `onClick`；**Model / Service 里禁止读 Input**

### 5.4 对象交互（碰撞 / 触发）

- 检测用 Unity 原生（`OnTriggerEnter2D` 等，照常写）
- 检测到的**结果**按 §5.1 决策表分流：改状态 → Model 写方法；广播 → EventModule；局部表现（特效 / 音效）→ 直接调用
- 3D 空间音效用原生 `AudioSource.PlayClipAtPoint`（AudioModule 不做空间音效）

### 5.5 音频（RAM 现成，零配置即用）

```csharp
AudioModule.PlaySfx(hitClip, pitchJitter: 0.1f);    // 一击即走，音调随机抖动防机械感
AudioModule.PlayBgm(gameBgm);                        // 同曲在播时幂等返回（跨场景不打断）
AudioModule.PlayBgm(resultBgm, fadeSeconds: 1.5f);   // 淡出旧曲 → 淡入新曲
AudioModule.PauseAll();                              // 暂停菜单 / 切后台
AudioModule.ResumeAll();
```

- `PlaySfx` 为 fire-and-forget，无播完回调——需要回调按 §5.1 用 MiniEvent
- 音量三通道（Master / BGM / SFX）设置即时生效并自动持久化；连续拖动的滑条请在拖动结束时一次性写入

## 6. 目录结构与命名（AI 放文件的地图）

```
Assets/
├── Scripts/
│   ├── Contexts/          GameContext.cs（全项目唯一）
│   ├── Models/            XxxModel.cs
│   ├── Services/          XxxService.cs（可选）
│   ├── GameEvents/        OnXxxEventArgs.cs（EventModule 载体）
│   ├── Gameplay/          PlayerController.cs 等（输入 / 碰撞入口）
│   └── UI/
│       ├── Panels/        XxxPanel.cs
│       └── Windows/       XxxWindow.cs
├── Prefabs/UI/            XxxPanel.prefab / XxxWindow.prefab
├── Resources/UI/          （ResourcesUILoader 按面板类型名加载）
│   ├── UIModuleConfig/    （编辑器自动生成，不要手改）
│   └── SceneModuleConfig/ （编辑器自动生成，不要手改）
└── Scenes/                00_Bootstrap.unity / Game.unity
```

- **不拆 asmdef**（全进 Assembly-CSharp）；Jam 后再按模块拆程序集
- RAA / RAM 以 UPM Git URL 安装（只读包，不碰业务代码区）

### 命名速查

| 对象 | 规则 | 例 |
|---|---|---|
| Context | `XxxContext`，全项目唯一 | `GameContext` |
| Model | `XxxModel` | `ScoreModel` |
| Service | `XxxService` | `StageService` |
| 面板 | `XxxPanel` = 脚本名 = 预制体名 | `HudPanel` |
| 窗口 | `XxxWindow`（禁 `XxxCanvas`） | `PauseWindow` |
| 事件参数 | `OnXxxEventArgs` | `OnPlayerDied` |
| 状态字段 | `ObservableValue` 实例私有持有 + 只读属性暴露 | `_score` → `Score` |
| UI 引用 | `[SerializeField]` 私有字段 | `[SerializeField] Text scoreText` |

## 7. AI 写作守则（写代码前的固定动作）

**新功能固定流程**：

1. 状态要被 UI 显示？→ 加入对应 `Model`（`ObservableValue` 字段 + 写方法）→ 面板 `OnShow` 订阅刷新
2. 一次性广播？→ `GameEvents/` 建 `XxxEventArgs` → EventModule 发布 / 订阅
3. 新界面？→ 查 §4.2 选型表 → 建 `XxxPanel` / `XxxWindow`（基类与命名按 §4.3）
4. 拿不到对象？→ `GameContext.Instance.GetModel<T>()` / `GetService<T>()`（fail-fast，按异常消息里的提示修）
5. 写完自查 §8 陷阱表

**禁止清单**：

- 禁止建第二个 Context；禁止在 `Configure()` / `OnInitialize()` 里访问 `Instance`
- 禁止在 Model 写方法之外直改 `ObservableValue`（`model.Score.Value++` 只能出现在 ScoreModel 内部）
- 禁止订阅不绑定 `RemoveListenerWhen*` 生命周期句柄
- 禁止面板之间直接引用 / 调用（走 Model 或 EventModule）
- 禁止在 Model / Service 里读 `Input`、`GameObject.Find`、`GetComponent`
- 禁止自建 UI 管理器 / 单例管理器 / 事件总线（UI / 场景 / 音频用 RAM 现成模块）
- 禁止 try-catch 吞掉 RAA 的 fail-fast 异常
- 禁止给 Model 写 UnityEvent 字段、禁止 `public Action` 代替 `event`

**参考示例（Package Manager → Samples 导入对照）**：

- `Counter-Mvc-Quick` / `Counter-Mvc-Standard`——六档对照主线，重点看每档「多出来的那一个概念」
- `PlaneWar` 实战——得分 HUD（ObservableValue）+ 三型敌机 + MiniEvent / MonoLifecycleProxy 组合，最接近 Jam 形态

## 8. 高频陷阱速查（写错了按这张表修）

| 症状 | 根因 | 修法 |
|---|---|---|
| `GetModel<T>()` 抛「未注册」 | Register / Get 类型参数不一致 | 同类型参数（统一具体类） |
| 出现第二个 Context / 空引用 | `Configure` / `OnInitialize` 里访问了 `Instance` | 模块间访问移到 `OnInitialize` 之后（全部模块已注册） |
| 抛「该 Model 尚未初始化」 | 注册顺序错误 / 循环依赖 | `Configure` 中被依赖的模块先注册 |
| 一个监听者抛异常后，后面的不执行 | MiniEvent fail-fast（= 原生 event 语义） | 监听回调内部自行 try-catch |
| 物体销毁后仍收到事件 / 内存泄漏 | Handle 未绑定生命周期 | `.RemoveListenerWhenGameObjectOnDisable(gameObject)`（UI 面板） |
| 事件链被外部整体置空 | `public Action` | 声明 `event Action` |
| 面板缓存复用后再显示不刷新 | 订阅放 `OnInit` + OnDisable 退订 | 订阅放 `OnShow` + `RemoveListenerWhenGameObjectOnDisable` |
| 场景切换后 UI / 注册表消失 | UI 没走 UIRoot（DDOL）/ 预放置模块 DDOL 被关 | UIRoot / AesirModules / EventModule 保持 `dontDestroyOnLoad` 开启 |
| 叠加场景卸载不干净 | 同一路径重复 `LoadSceneAdditive` | 同一路径只叠加一次 |
| 切后台 / 暂停后 BGM 不停 | 没调暂停 API | 暂停处 `AudioModule.PauseAll()` / 恢复处 `ResumeAll()` |
