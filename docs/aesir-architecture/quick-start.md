# 快速开始

本页带你用 5 步跑起第一个 AesirArchitecture 示例（以计数器为例），覆盖 Context、Model、View、Command、事件总线五大核心机制。

## 安装

### 通过 UPM（Git URL）

在 Unity Package Manager 中通过 Git URL 安装：

```
https://github.com/yuumixcode/aesir-architecture.git
```

### 手动安装

将本包目录复制到项目的 `Packages/` 目录下即可。

## 1. 定义 Context

```csharp
using Runestone.AesirArchitecture;

public class CounterContext : AbstractContext<CounterContext>
{
    protected override void Configure()
    {
        RegisterModel<ICounterModel>(new CounterModel());
    }
}
```

## 2. 定义 Model

```csharp
public interface ICounterModel : IModel
{
    IReadOnlyObservableValue<int> Count { get; }
    void Increase();
    void Decrease();
    void Reset();
}

public sealed class CounterModel : AbstractModel, ICounterModel
{
    readonly ObservableValue<int> _count = new ObservableValue<int>(0);

    public IReadOnlyObservableValue<int> Count => _count;

    public void Increase() => _count.Value++;
    public void Decrease() => _count.Value--;
    public void Reset() => _count.Value = 0;

    protected override void OnInitialize() { }
}
```

## 3. 定义 View（MVC 模式）

```csharp
public class UICounterMvcPanel : AesirView<CounterContext>
{
    [SerializeField] Text countText;
    [SerializeField] Button increaseButton;

    ICounterModel _model;
    ICounterController _ctrl;

    void Awake()
    {
        _model = this.GetModel<ICounterModel>();
        _model.Count.AddListener(UpdateCountText)
                   .RemoveListenerWhenGameObjectOnDestroyed(gameObject);
        _ctrl = new CounterController(_model);
    }

    void OnEnable() => increaseButton.onClick.AddListener(_ctrl.Increase);
    void OnDisable() => increaseButton.onClick.RemoveListener(_ctrl.Increase);

    public void UpdateCountText(int count) => countText.text = count.ToString();
}
```

## 4. 使用 Command

```csharp
// 定义命令
public class AddScoreCommand : AbstractCommand
{
    protected override void OnExecute()
    {
        var model = this.GetModel<IScoreModel>();
        model.AddScore(10);
    }
}

// 执行命令
this.ExecuteCommand<AddScoreCommand>();
```

## 5. 使用事件总线

```csharp
// 定义事件参数
public struct ScoreChangedEvent : IEventArgs
{
    public int NewScore;
}

// 添加监听
this.AddListener<ScoreChangedEvent>(e => Debug.Log($"Score: {e.NewScore}"))
    .RemoveListenerWhenGameObjectOnDestroyed(gameObject);

// 发布
this.InvokeEvent(new ScoreChangedEvent { NewScore = 100 });

// 发布无参事件（T 必须有无参构造）
public struct GameStartedEvent : IEventArgs { }
this.InvokeEvent<GameStartedEvent>();
```

> 看到这里，建议回到 [架构总览](architecture.md) 对照能力矩阵，理解每个角色（`IModel` / `IView` / `IController` / `IPresenter`）分别拥有哪些能力。
