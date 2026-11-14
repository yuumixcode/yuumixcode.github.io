# Unity 场景管理方案横评：从单场景流水线到分区流式加载

一个项目怎么切场景，本质是在回答三个问题：**谁能活过场景切换**、**切的时候要不要黑屏**、**资源什么时候进内存**。这三个问题的答案组合起来，就是市面上几乎所有"场景管理方案"。

本文先把零件拆开（三个原语），再给六个可直接落地的方案，最后按「小游戏 / 微信小游戏 / 独立游戏 / 大型商业」四档给出推荐组合与代价。

!!! abstract "结论先行"
    - **单场景 + DontDestroyOnLoad** 能用，但只适合把它当"基础设施容器"（UIRoot、音频、会话），别把业务状态塞进去。
    - Unity 官方手册明确**不建议**用 `DontDestroyOnLoad` 承载管理器，推荐「管理器场景 + Additive」——这是中大型项目的事实标准。
    - **`LoadSceneMode.Single` 会关闭所有已加载场景**，包括你叠加的 UI 层。这就是商业项目最终都走"全 Additive + 手动卸载"的根本原因。
    - 微信小游戏不是"选方案"，是**被包体预算倒逼**：主包 ≤ 4 MB、主包+分包 ≤ 30 MB，资源必须走远程 AB/CDN，场景只能做薄。

---

## 一、先把零件拆开：三个原语

所有方案都是这三个原语的排列组合，先把语义钉死，后面讨论才不会飘。

| 原语 | API | 语义边界 | 代价 |
| --- | --- | --- | --- |
| **替换** | `LoadScene(name, LoadSceneMode.Single)` | **关闭所有当前已加载场景**，再加载新场景 | 世界全量重建；自动触发 `Resources.UnloadUnusedAssets` |
| **叠加** | `LoadScene(name, LoadSceneMode.Additive)` | 在当前场景集上再加一个，互不销毁 | 生命周期、光照、UI 分层全靠自己管 |
| **持久化** | `DontDestroyOnLoad(obj)` / 常驻管理器场景 | 让对象活过场景切换 | 隐式、不可打开/保存、引用难序列化 |

!!! warning "两条最容易被忽略的官方语义"
    1. `LoadSceneMode.Single` 的官方描述是 **"Closes all current loaded Scenes and loads a Scene."** 不是"换掉主场景"——你叠加的 UI 场景、音频场景会一起没。
    2. `AsyncOperation.allowSceneActivation = false` 时，`progress` 会**停在 0.9** 且 `isDone` 为 false；更麻烦的是，**Unity 的 AsyncOperation 队列会被整体阻塞**，此时发起的 `UnloadSceneAsync` 不会开始执行（官方 Script Reference 原文说明）。

### 持久化的两条路：隐式 vs 显式

```text
隐式（DDOL）                         显式（Manager Scene）
─────────────────                    ─────────────────────
Boot ─┐                              Boot ──► Manager(scene, 常驻)
      │  DDOL 对象被挪到                 │        ├─ Services
      │  一个运行时伪场景               │        ├─ UIRoot
      ▼  （仅 Play 可见，不可打开/保存） ▼        └─ Audio
Game ──► 切换后仍在                  Game(scene) 叠加/替换
```

Unity 手册的原话是：

> It is recommended to avoid using DontDestroyOnLoad to persist manager GameObjects that you want to survive across scene loads. Instead, create a manager scene that has all your managers and use `SceneManager.LoadScene(, LoadSceneMode.Additive)` and `SceneManager.UnloadScene` to manage your game progress.

翻译成人话：**DDOL 是"逃生舱"，不是"机房"**。逃生舱适合带几个人走，不适合把整个服务层搬进去。

---

## 二、六个方案

下面每个方案都给：结构、优势、代价、什么时候别用。方案 A–E 是"场景结构"，F 是"资源层"，F 与 A–E 正交，可以叠加。

### 方案 A：单场景流水线 + DDOL（你提的第一种）

```text
Boot ──Single──► Main ──Single──► Battle ──Single──► Main
      └──────── DDOL: GameManager / UIRoot / AudioManager ────────┘
```

**结构**：任意时刻只有一个"内容场景"，管理器与 UI 根挂在 `DontDestroyOnLoad` 上。流程就是你说的启动 → 主城 → 战斗，靠 `Single` 一路替换。

**优势**

- 心智负担最低：场景即状态机状态，"在哪个场景"就是"在哪个状态"。
- 单个场景能独立 Play，迭代快；Build Settings 就是流程表。
- 没有 active scene 歧义，光照/天空盒/后处理天然跟着场景走。
- 崩溃/断线恢复简单：读档 = `LoadScene(存档场景)`。

**代价（都是真会咬人的）**

1. **DDOL 重复实例**：从 Main 进 Battle 再回 Main，如果 Main 场景里还有一份管理器，就会有第二份。社区里这个坑反复出现，标准解法是管理器根本不放在任何内容场景里，用 `[RuntimeInitializeOnLoadMethod]` 或 Manager 场景创建。
2. **跨场景引用脆弱**：`Single` 下"直接挂引用"看着能用，一旦改成 Additive 或接 Addressables 就全断。业务层应该只依赖接口/事件，不依赖场景对象引用。
3. **UI 与场景生命周期脱钩**：DDOL 上堆了十几个面板，切场景前谁负责清场？没有约定就一定会有"战斗结算界面飘在主城里"。
4. **隐式常驻内存**：DDOL 对象引用的资源永远不会被 `UnloadUnusedAssets` 回收，属于看不见的内存泄漏源。
5. **无法表达"叠加态"**：主城 + 战斗预加载、过场动画叠在战斗上、暂停菜单独立于关卡——这些它做不到。

**什么时候别用**：需要无缝、需要"关卡 + 常驻 UI + 过场"三者并存、需要远程下发场景。到那一步就该换 B/C。

**怎么把 A 用到不后悔**

- DDOL 只放 3 类：`UIRoot`、`AudioService`、`GameSession`（纯数据）。
- 所有切换收敛到一个 `SceneFlow` 类，禁止业务代码直接调 `SceneManager`。
- 每个场景有一个根节点 `SceneRoot`，负责本场景的初始化与清理，切走前由 `SceneFlow` 统一调用 `OnExit`。

### 方案 B：Bootstrap + 常驻管理器场景（官方推荐路线）

```text
Boot(极薄) ──Additive──► Manager(常驻，永不卸载)
                              │
                              ├─Additive──► Menu
                              ├─Additive──► Main
                              └─Additive──► Battle
```

**结构**：`Boot` 只做三件事——初始化、首屏、把 `Manager` 叠加进来，然后自己可以被丢弃。`Manager` 场景承载全局服务、UIRoot、音频、配置，从头活到尾。

**关键设计：自举检查**。每个内容场景的 `SceneRoot` 在 `Awake` 里检查 `Manager` 是否已加载，没有就补上。这样在编辑器里从任意场景按 Play 都能跑，不用每次回 Boot。

```csharp
// 内容场景根节点上的自举检查：编辑器从任意场景启动也能得到完整上下文
static void EnsureManagerScene()
{
    var s = SceneManager.GetSceneByName("Manager");
    if (s.isLoaded) return;
    SceneManager.LoadScene("Manager", LoadSceneMode.Additive);
}
```

**优势**

- 层次**显式可见**：Hierarchy 里就是 `Manager / Game / UI`，出问题一眼能看出少加载了谁。
- Manager 场景里的引用是**可序列化**的，不像 DDOL 那样"编辑器里看不见、改不了"。
- 团队协作按场景切文件，冲突面小；美术改关卡不碰服务层。
- 契合 Addressables：管理器场景可以打成常驻包，内容场景各自成包。

**代价**

- 多一个"几乎空"的场景要维护，新人容易困惑。
- 加载顺序靠代码保证（Boot 先于内容），不能靠 Build Settings 顺序。
- Manager 场景不能放渲染相关设置，否则会成为全局污染源。

### 方案 C：分层叠加（Manager + Game + UI + Audio）

```text
┌─────────────────────────────┐
│ UI Layer      (Additive)    │  ← 常驻，切关卡不闪断
├─────────────────────────────┤
│ Gameplay      (Additive)    │  ← 按状态换
├─────────────────────────────┤
│ Audio / VFX   (Additive)    │  ← 按需
├─────────────────────────────┤
│ Manager       (Additive)    │  ← 永不卸载
└─────────────────────────────┘
```

**核心变化**：**不再用 `Single`**。切关卡 = 卸载旧 Gameplay 场景 + 叠加新 Gameplay 场景。

为什么必须放弃 `Single`？因为它会关掉所有场景，你的 UI 层、音频层会跟着没，于是"切场景 → UI 重建 → 闪一下 → 音频断一下"就出现了。

```csharp
// 全 Additive 的切换骨架：先加载新的，再卸旧的，最后重设 active scene
IEnumerator SwitchContent(string next)
{
    var load = SceneManager.LoadSceneAsync(next, LoadSceneMode.Additive);
    while (!load.isDone) { yield return null; }

    SceneManager.SetActiveScene(SceneManager.GetSceneByName(next));
    yield return SceneManager.UnloadSceneAsync(_currentContent);
    _currentContent = SceneManager.GetSceneByName(next);
}
```

**优势**

- UI、音频、全局服务不随关卡重建，切场景无闪断。
- 天然支持"加载中"：先叠一个 Loading 场景，再叠内容，最后卸 Loading。
- 支持多状态并存：战斗 + 暂停菜单 + 过场动画各占一层。

**代价**

- `SetActiveScene` 必须自己管：**光照、天空盒、雾、导航设置都取自 active scene**，忘了切就是"新关卡用了旧关卡的光照"。
- 卸载时序要设计：先卸逻辑（脚本、事件、协程），再卸表现（模型、贴图、粒子），否则 `OnDestroy` 里访问已卸载对象会报一堆 null。
- 每个场景都要遵守"根节点约定"，否则禁用/启用、批量卸载都无从下手。

### 方案 D：常驻缓存 + 权重预算（Scene Cache / Budget）

**结构**：场景全部 Additive 加载，离开时不卸载，只**停用它的根节点子物体**；再次进入变成"启用"而不是"加载"。SceneManager 为所有已加载场景维护一个总预算（MB），超预算时按 LRU/优先级卸载。

```text
进场景：已加载 → 启用(OnEnable 初始化)  未加载 → 加载
预算：Σ weight(已加载场景) > budget → 按最久未用淘汰
```

**优势**

- 二次进入几乎零加载，回城/往返关卡的体感差别巨大。
- 可以按平台设预算：Switch 和 PC 用同一套代码不同参数。
- 配合"邻居预加载"，玩家走到门口时目标场景已经就绪。

**代价（有一个很隐蔽的）**

- 初始化逻辑必须写在 `OnEnable`，不能写 `Start`——否则"第二次进入"时初始化不会跑。
- 停用场景时要记录"本来就被关掉的子物体"，再次启用不能无脑全开（比如玩家已解锁的暗门不该复活）。
- **预加载会卡帧**：实测加载期会有 3–4 帧、每帧约 50 ms 的尖刺，Profiler 指向 `Gfx.WaitForPresentOnGfxThread` → `Gfx.UploadTextureData`，即纹理上传。解决方向是 Quality Settings 里的 async upload buffer / time slice，并分帧预加载。
- 常驻内存峰值高，低端机要严格限预算。

**适用**：开放世界、区域间高频往返、内存受限的卡带平台。

### 方案 E：分区流式加载（Streaming / 分块）

```text
World(骨架，常驻) ─┬─ Zone_00_00 (Additive)
                   ├─ Zone_00_01 (Additive)
                   ├─ Zone_01_00 (Additive)  ← 按距离/触发器加减
                   └─ ...
```

**结构**：一个"世界骨架"（地形索引、全局光照、导航、天空）常驻，区域场景按玩家位置加减。触发方式两种——**距离驱动**（适合室外/开放世界，配合雾遮住切换）和**触发器驱动**（适合室内/关卡段落，控制更精确）。Unity 官方的 ScriptableObject 场景工作流文章正是这两种。

**优势**：世界尺度不再受单场景限制；美术可以分块并行制作；编辑器里多场景同时打开就能预览整关。

**代价**

- 跨块问题：NavMesh 在边界断开、光照探针/反射探针要合并、遮挡剔除数据要共享。
- 流式过程本身就是性能预算的大敌：加载、实例化、GC、纹理上传都在玩的时候发生。
- 必须有优先级与节流（同帧最多加载一个分区、把 `Application.backgroundLoadingPriority` 调到合适档位）。
- DOTS `SubScene` 是这条路的一种实现形态，适合海量实体，但把"实体流式"和"场景流式"混为一谈会付出学习成本。

### 方案 F：内容层（Addressables / AssetBundle / CDN）

这一层不改变场景结构，但改变了**场景从哪来**。

| 维度 | 直接引用 / Build Settings | Addressables |
| --- | --- | --- |
| 场景来源 | 打进包体 | 本地包或远端 CDN |
| 热更 | 不可能 | 支持内容更新 |
| 内存 | 全量常驻 | 引用计数，可卸 |
| 加载 | 同步/异步，路径短 | 初始化 catalog → 下载 → 加载，路径长 |
| 失败面 | 小 | 网络、版本、缓存、句柄泄漏 |

必须知道的三件事：

1. `Addressables.LoadSceneAsync` 内部就是 `SceneManager.LoadSceneAsync`，`loadMode` / `activateOnLoad` / `priority` 语义完全一致。
2. `Single` 模式会卸载当前场景并**自动调用 `Resources.UnloadUnusedAssets`**；大面积卸载时这一步会造成明显卡顿，商业项目更倾向自己控制卸载时机。
3. 卸载要用**同一个 handle** 的 `Addressables.UnloadSceneAsync(handle)`，而不是 `SceneManager.UnloadScene`，否则引用计数对不上，asset 永远不释放。

!!! tip "隐式依赖是包体膨胀的头号来源"
    场景里引用了非 Addressable 的资源，它会变成该场景的隐式依赖被打进同一个 bundle；同一资源被多个场景引用时就会**重复打包**。用 Build Layout Report 定期体检，是商业项目的常规动作。

---

## 三、方案 × 规模：一张表看完

● 推荐　○ 可用　× 不建议

| 方案 | 小游戏 | 微信小游戏 | 独立游戏 | 大型商业 |
| --- | :---: | :---: | :---: | :---: |
| A 单场景 + DDOL | ● | ● | ○ | × |
| B Bootstrap + Manager 场景 | ○ | ● | ● | ● |
| C 分层叠加（全 Additive） | × | ○ | ● | ● |
| D 常驻缓存 + 预算 | × | × | ○ | ● |
| E 分区流式加载 | × | × | ○ | ● |
| F Addressables / CDN 内容层 | ○ | ● | ● | ● |

读法：**规模越大，方案是"叠加"而不是"替换"**。大型商业 = B + C + D + E + F 同时用；小游戏选一个就够。

---

## 四、四档规模的落地建议

### 4.1 小游戏（1–2 人、数周、几十 MB）

**选 A，最多 A + B 的简化版。**

```text
Boot(加载+首屏) ──► Game ──► Result ──► Game
        DDOL: UIRoot / Audio / Session
```

- 就两个场景：`Boot`（初始化 + 加载条）和 `Game`（主玩法 + 结算）。别做分层叠加，收益抵不过复杂度。
- UI 放 DDOL 的一个 Canvas，面板用"栈"管理，切场景前 `CloseAll()`。
- 唯一必须做对的事：**把 `SceneManager` 调用封在一个 30 行的 `SceneFlow` 里**。以后长大要换 B/C，只改这一个文件。
- 资源直接用引用即可，别为了"规范"提前上 Addressables——它会把首包初始化时间从 0 变成几百毫秒。

### 4.2 微信小游戏（包体是硬约束）

先看约束（微信官方「分包加载」文档）：

| 项 | 限制 |
| --- | --- |
| 主包 | ≤ 4 MB |
| 全部主包 + 分包 | ≤ 30 MB |
| 单个普通分包 | 不限大小 |
| 单个独立分包 | ≤ 4 MB |

API 侧：`wx.loadSubpackage` 加载分包并返回 `LoadSubpackageTask`（可拿 `onProgressUpdate` 做进度），`wx.preDownloadSubpackage` 做预下载（基础库 3.4.9+）。

**结论：微信小游戏 = 方案 B + F，禁止 D/E。**

- **首包只放**：引擎运行时、Boot 场景、加载 UI、极少量的字体/图标。任何"大图"都不该在主包里。
- **资源全走远程**（CDN 上的 AssetBundle / Addressables 远端组），本地只留索引与版本号；`Resources/` 目录在这个平台基本等于"把资源塞进主包"，应避免。
- **场景要薄**：一个场景里塞三套美术资源，在小游戏的内存模型下就是闪退。宁可拆成 `Level_01_A` / `Level_01_B` 两个可 Additive 叠加的场景。
- **进度条必须是真的**：小游戏的等待由两段组成——分包/AB 下载（网络）与场景加载激活（CPU）。两段都要有进度反馈，否则玩家会以为卡死。
- **常驻对象要少**：DDOL 里只放 UIRoot 与音频，且音频源数量受控；iOS 低内存机型是小游戏闪退高发区。
- **切场景优先 Additive 换内容层**，避免 `Single` 触发全量卸载 + 重建（在小游戏这种"引擎本身就很重"的环境里，重建代价更明显）。

!!! note "一个常被忽略的成本"
    方案 F 的代价在小游戏上会被放大：catalog 初始化、远端下载、解压、AB 缓存写入都在首屏。要把"首屏可交互时间"当成一等指标，而不是等美术都做完了再优化。

### 4.3 独立游戏小项目（3–8 人、数月、PC/主机）

**选 B + C + F。**

```text
Boot ──► Manager(常驻: Services / UIRoot / Audio / Save)
              ├─ Menu        (Additive)
              ├─ Chapter_01  (Additive, 卸载旧章节时先卸逻辑再卸表现)
              └─ Battle      (Additive, 与 Chapter 并存做转场)
```

- 章节切换用 Additive，**只有"回主菜单 / 重开一局"才用 Single**（此时你需要一次彻底重置）。
- UI 独立成场景，常驻叠加在 Manager 之上，切关卡不闪断。
- Addressables 按「场景 + 共享依赖」分组：共享材质/图集单独放一组，否则每个场景包各带一份。
- 加一个"从任意场景 F5"的自举检查，团队效率提升明显。
- 还不需要 D / E：除非关卡之间要反复往返、加载时间已经明显影响体验。

### 4.4 大型商业游戏

**B + C + D + E + F 全上，且要工程化。**

- **Entry 场景永不卸载**：行业里常见做法是有一个 `EntryPoint` / `Persistent` 场景，从启动活到退出，承载资源加载、场景加载、设置、相机、账号等核心服务；其余场景全部叠在它上面。
- **分层 Manager**：Global（永不卸载）+ Sub-Global（按游戏状态存在，例如"战斗子管理器"随战斗场景加载/卸载）。避免一个 God Manager 活到天荒地老。
- **状态机驱动**：`Boot → Login → Lobby → Matchmaking → Battle → Result`，每个状态声明"需要哪些场景 + 哪些服务"，由状态机负责 diff（加载缺的、卸载多的）。这才是"商业级"和"能跑"的区别。
- **三段式加载**：`准备（下载/依赖） → 预热（Shader 变体、材质、实例化池） → 激活（allowSceneActivation）`。只在最后一步切画面，避免激活瞬间的编译/上传尖峰。
- **预算与淘汰**：场景带权重，总预算按平台配置；预加载服从预算；LRU + 优先级而不是纯 LRU。
- **内容更新**：场景作为可下发内容，远端 CDN + 版本清单；注意内容更新对静态内容的限制（已发布的静态包内容不可改，只能加）。
- **可观测性**：每个场景加载要有耗时埋点（下载 / 反序列化 / 激活 / 首次渲染），否则线上"加载慢"永远只能猜。

---

## 五、UI 到底放哪：四种放法对比

```text
① DDOL Canvas        ② UI 独立场景        ③ 场景自带 Canvas     ④ 代码生成(UI Toolkit)
   ┌──────────┐        ┌──────────┐         ┌──────────┐          ┌──────────┐
   │ UI Root  │        │ UI Scene │         │ Game+UI  │          │ 无场景UI │
   └──────────┘        └──────────┘         └──────────┘          └──────────┘
```

| 放法 | 切场景表现 | 状态保持 | 协作/版本控制 | 主要风险 | 适合 |
| --- | --- | --- | --- | --- | --- |
| ① DDOL Canvas | 不闪断 | 手动管理 | UI 与场景分离，冲突少 | 面板残留、DDOL 重复实例 | 小游戏、原型 |
| ② UI 独立场景（Additive） | 不闪断 | 场景内状态自然保留 | 清晰，UI 单独一个文件 | 需要 active scene 管理；`Single` 会连它一起关掉 | 独立游戏、商业项目 |
| ③ 场景自带 Canvas | 随场景重建（会闪） | 随场景销毁 | UI 与关卡强耦合，冲突多 | 每个场景重复搭 UI；跨场景 HUD 要复制 | 强上下文界面、VR、多相机 |
| ④ 代码生成（UI Toolkit / 预制体池） | 完全可控 | 由代码管理 | 无场景文件冲突 | 调试成本高，设计师不友好 | 工具类 UI、HUD、性能敏感场景 |

**推荐组合**（大多数项目的最优解）：

- **全局层**（登录、设置、弹窗、Toast、加载条）→ ② 独立 UI 场景，常驻。
- **HUD / 战斗内界面** → ③ 跟随战斗场景，因为它和战斗数据强绑定，卸载时一起走最省心。
- **编辑器调试面板** → ④ 代码生成，不进正式包。

这样"该常驻的常驻、该一起死的跟着死"，比"全塞 DDOL"和"全放场景里"都好维护。

---

## 六、场景根节点（SceneRoot）规范

!!! note "这不是 Unity 的机制，是团队约定"
    Unity 没有"场景级生命周期"：`SceneManager` 只告诉你加载完成，不告诉你这个场景该初始化什么、离开时该清什么。`SceneRoot` 就是用一个顶层容器把这个缺口补上。

### 6.1 约定本身

**每个场景有且只有一个顶层容器 GameObject，场景里所有内容都是它的子节点，容器上挂 `SceneRoot` 组件。**

```text
Battle.unity
└─ [Scene] Battle          ← SceneRoot 组件（无 Renderer / 无 Collider / 不做位移）
   ├─ Environment          ← 地形、背景、装饰
   ├─ Gameplay             ← 角色、敌人、交互物
   ├─ Lighting             ← 光照探针、反射探针
   ├─ Markers              ← 出生点、相机机位
   └─ Audio (可选)
```

单场景时代你不需要它；一旦上 Additive 就非常需要——因为**"场景"这个单位本身没有 `Awake` 和 `OnDestroy`**，`SceneRoot` 就是它的替身。

### 6.2 它到底带来什么

| 收益 | 具体表现 |
| --- | --- |
| **生命周期收口** | 初始化顺序收在 `SceneRoot.Awake / Enter` 里，而不是散在十几个 `Start()` 里靠执行顺序撞运气 |
| **整场景批量开关** | 关掉 root 的子节点 = 这个场景休眠。这是「常驻缓存 + 权重预算」（方案 D）能成立的前提 |
| **干净的离开** | `Exit()` 集中停协程、退订事件、释放 Addressables handle、回收对象池；跨场景残留 bug 十有八九是"没人负责清" |
| **状态快照** | 记录"进入时本来就被关掉的子物体"（如玩家已开的暗门），下次启用不会误开——方案 D 最容易被忽略的坑 |
| **查找与隔离** | 从 `root.Content` 往下找，而不是 `GameObject.Find` 全局搜索；层级稳定后还能做成场景 Prefab 模板 |
| **自举的落点** | `Awake` 里检查 Manager 场景是否加载、缺失就补，这就是"编辑器从任意场景 Play 都能跑"的实现位置 |
| **可工具化** | 约定固定后能写编辑器校验器：扫描所有场景检查 root 是否存在/唯一、EventSystem 是否重复、光照是否烘焙 |
| **降低冲突** | 层级形状固定，两人同改一个场景时冲突面小；美术与程序可以按子节点分工 |

### 6.3 参考实现

```csharp
using System.Collections.Generic;
using UnityEngine;

[DisallowMultipleComponent]
public sealed class SceneRoot : MonoBehaviour
{
    [SerializeField] SceneDefinition definition;   // 场景元数据：显示名 / 加载组 / 权重 / 是否常驻
    [SerializeField] Transform content;            // 所有内容挂这里，root 自己不放东西

    readonly List<GameObject> _stayedDisabled = new();

    public SceneDefinition Definition => definition;
    public Transform Content => content;

    void Awake()
    {
        // 1) 自举：编辑器里从任意场景 Play 也能拿到全局上下文
        Bootstrap.EnsureManagerScene();
        // 2) 依赖收口：本场景需要的服务在这里解析/注入，而不是散在业务 Awake 里
    }

    /// <summary>进入场景：先恢复上次的快照，再放行本场景的初始化。</summary>
    public void Enter()
    {
        foreach (var go in _stayedDisabled) go.SetActive(false);   // 保持"本来就关着"的状态
        // 这里再触发 View / Controller 的初始化
    }

    /// <summary>离开场景：先记快照，再清干净。</summary>
    public void Exit()
    {
        _stayedDisabled.Clear();
        foreach (Transform child in content)
            if (!child.gameObject.activeSelf) _stayedDisabled.Add(child.gameObject);

        // 停协程、退订事件、释放 Addressables handle、对象回池
    }
}
```

### 6.4 四条反模式

!!! warning "这样用就白立规矩了"
    - **root 上写业务逻辑**：它会变成 God Object，比没有 root 更糟。root 只做「容器 + 生命周期入口」。
    - **root 上挂 `DontDestroyOnLoad`**：root 代表"这一个场景"，不该活过它；要常驻的东西放 Manager 场景。
    - **一个场景多个 root**：等于没有 root，约定与工具同时失效。
    - **把 UI 和关卡塞进同一个 root**：分层叠加要求 UI 能单独开关，物理上就该分成两个场景（或至少两个一级容器）。

### 6.5 三个容易混的概念

| 概念 | 职责 | 生命周期 | 放在哪 |
| --- | --- | --- | --- |
| **Bootstrap** | 全局入口：初始化设置、资源层、首屏 | 进程级（或到进主菜单为止） | 独立极薄场景，自己不做内容 |
| **SceneRoot** | 场景容器与生命周期入口 | 与场景同生共死 | 每个场景唯一的顶层物体 |
| **View / Controller** | 局部表现与逻辑 | 随所属对象 | root 的某个子节点下 |

生命周期长度依次递减，职责不要互串。最常见的错是把 Bootstrap 的活写进 SceneRoot，于是每个场景都在重复初始化全局服务。

### 6.6 顺手加一个编辑器校验

约定只有能被机器检查才活得久。一个菜单项扫描 `Assets/Scenes/` 下所有场景即可：

- 顶层对象数量是否为 1，且挂了 `SceneRoot`；
- `content` 是否为空、是否被误挂在 root 自己身上；
- 场景内 `EventSystem` / `AudioListener` / 主相机是否唯一；
- 是否有丢失引用、未烘焙光照或重复的常驻服务。

跑一次几秒钟，比靠 Code Review 记住规矩可靠。

---

## 七、十二个坑（按踩到概率排序）

!!! danger "1. Single 会把你的叠加层一起关掉"
    `LoadSceneMode.Single` 的语义是 **关闭所有已加载场景**。UI 场景、音频场景、Loading 场景都会没。要么全 Additive 自己卸，要么接受重建。

!!! danger "2. `allowSceneActivation = false` 会阻塞全局异步队列"
    `progress` 停在 0.9 只是表象；官方文档写明此时**其它 AsyncOperation（例如 `UnloadSceneAsync`）不会被调用**，直到你把它设回 true。别在等待玩家按键的加载条里同时发起卸载。

!!! danger "3. 忘了 `SetActiveScene` → 光照/天空盒错乱"
    光照设置、天空盒、雾、导航网格都取自 active scene。Additive 加载后不切 active scene，新关卡就会沿用地形场景的光照。

!!! warning "4. DDOL 重复实例"
    内容场景里再放一份管理器，场景重进一次就多一份。管理器只应该来自 Manager 场景或 `RuntimeInitializeOnLoadMethod`。

!!! warning "5. 进度条假死"
    直接拿 `async.progress` 画条，会在 0.9 卡住不动。要么映射 `progress / 0.9f`，要么自己按"下载 / 加载 / 激活"三段拼接。

!!! warning "6. 多 AudioListener / 多 EventSystem / 多 Camera"
    每个场景各带一份，叠加后就报 "There are 2 audio listeners in the scene"。约定：全局只有一个，内容场景里的默认禁用。

!!! warning "7. 跨场景引用在打包后断掉"
    编辑器里挂着的场景对象引用，进 Addressables 或换 Additive 后容易变 null。业务层只依赖接口与事件，别依赖场景对象引用。

!!! warning "8. 卸载顺序错，`OnDestroy` 里报 null"
    先卸逻辑层（停止协程、退订事件、清空单例），再卸表现层。反过来就会在已销毁对象上取组件。

!!! warning "9. NavMesh / 光照探针 / 遮挡剔除跨场景不合并"
    Additive 加载不会自动合并导航网格与探针。要么按场景各自烘焙并做边界处理，要么统一在世界骨架里烘焙。

!!! warning "10. 没有场景根节点约定"
    每个场景强制一个 `SceneRoot`，其下才是内容。有了它，Enable/Disable、批量清理、自举检查才有抓手（规范见上面的「六、场景根节点」）。

!!! warning "11. 编辑器里只能从 Boot 启动"
    团队会被迫每次回 Boot 按 Play。加自举检查（见方案 B），从任意场景都能跑。

!!! tip "12. 微信小游戏的包体与缓存"
    主包 4 MB 是硬红线；分包/AB 要考虑 CDN 缓存与版本号；首包体积每加 1 MB，转化率都在掉。

---

## 八、从「DDOL 单场景」迁移到「Manager 场景 + Additive」的最小路径

不用重写，五步走：

1. **抽一层门面**：新建 `SceneFlow`（或 `SceneService`），把项目里所有 `SceneManager.*` 调用改成走它。这一步不改行为，只收口。
2. **建 Manager 场景**：把 DDOL 上的管理器、UIRoot、音频搬进去；`Boot` 里改成 `LoadScene("Manager", Additive)`；删掉所有 `DontDestroyOnLoad` 调用。
3. **加自举检查**：每个内容场景的 `SceneRoot.Awake` 检查 Manager 是否加载，缺失就补。团队立刻能在任意场景 Play。
4. **内容切换改 Additive**：`SceneFlow.SwitchContent` 改成"加载新的 → SetActiveScene → 卸载旧的"。UI/音频层从此不参与切换。
5. **接资源层**：场景进 Addressables 分组，`SceneFlow` 内部换成 `Addressables.LoadSceneAsync` 并保存 handle；对外 API 不变。

每一步都能独立提交、独立回滚，中途不会出现"改到一半跑不起来"的状态。

---

## 九、参考来源

**官方文档（一手）**

- [Unity Manual — Work with multiple scenes](https://docs.unity.com/en-us/engine/6000.6/manual/working-with-scenes/multi-scene-editing) ：多场景编辑、场景级设置、active scene 行为。
- [Unity Manual — Multi-Scene editing（含"避免用 DontDestroyOnLoad 承载管理器"的建议）](https://docs.unity3d.com/2020.2/Documentation/Manual/MultiSceneEditing.html)
- [Script Reference — SceneManager.LoadScene](https://docs.unity3d.com/ScriptReference/SceneManagement.SceneManager.LoadScene.html) ：Single/Additive 语义、Single 触发 `UnloadUnusedAssets`。
- [Script Reference — LoadSceneMode](https://docs.unity3d.com/ScriptReference/SceneManagement.LoadSceneMode.html) ：Single = "Closes all current loaded Scenes"。
- [Script Reference — AsyncOperation.allowSceneActivation](https://docs.unity3d.com/ScriptReference/AsyncOperation-allowSceneActivation.html) ：0.9 进度、异步队列阻塞。
- [Addressables — Load a scene](https://docs.unity3d.com/Packages/com.unity.addressables@2.4/manual/LoadingScenes.html) ：与 SceneManager 参数对应、隐式依赖、卸载 handle。
- [Unity 官方博客 — 使用 ScriptableObjects 实现更好的场景工作流](https://unity.com/cn/blog/engine-platform/achieve-better-scene-workflow-with-scriptableobjects) ：距离驱动与触发器驱动的分区加载。
- [Unity — 组织项目的最佳实践](https://unity.com/cn/how-to/organizing-your-project) ：拆分场景、用 Prefab 降低协作冲突。
- [微信开放文档 — 分包加载](https://developers.weixin.qq.com/minigame/dev/guide/base-ability/subPackage/useSubPackage.html) ：主包/分包体积限制、`wx.loadSubpackage`、分包预下载。

**社区实践（二手，但可交叉验证）**

- [Unity Discussions — What is the best practice for scene management for a serious project?](https://discussions.unity.com/t/what-is-the-best-practice-for-scene-management-for-a-serious-project-how-do-commercial-games-set-it-up/341989) ：大项目普遍有永不卸载的 EntryPoint 场景。
- [Unity Discussions — Best practice to create "boot" scene, game overlay menu, and manage scenes](https://discussions.unity.com/t/best-practice-to-create-boot-scene-game-overlay-menu-and-manage-scenes/908245) ：Global / Sub-Global 分层。
- [Useless GameDev — Scene Management in Unity](https://www.uselessgamedev.com/articles/scene-management-in-unity.html) ：全 Additive + 停用/启用 + 权重预算 + 预加载纹理上传卡顿的实测。

!!! quote "一句话收尾"
    场景管理没有"最佳方案"，只有"和你现在的团队规模、包体预算、加载耐心匹配的方案"。**先选一个能跑的，再把切换口收成一个门面**——这才是以后能换方案的前提。

<!-- 配套交互版：scene-management-strategies.html（同目录，纯静态单文件，可直接双击打开） -->
