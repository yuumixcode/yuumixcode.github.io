# `MonoLifecycleProxy`

## 介绍

- 种类: `class`
- 所在程序集: `Runestone.AesirArchitecture`
- 所在命名空间: `Runestone.AesirArchitecture`

``` csharp
[DisallowMultipleComponent]
[DefaultExecutionOrder]
public sealed class MonoLifecycleProxy : Runestone.AesirArchitecture.AesirMonoBehaviour, 
Sirenix.Serialization.ISupportsPrefabSerialization, 
UnityEngine.ISerializationCallbackReceiver
```

### 注释

- Mono 生命周期事件代理。作为全局单例挂载在 [Aesir Architecture] GameObject 上， 将 Unity 原生生命周期回调和自定义 PlayerLoop 阶段统一为可订阅的有序事件。

## 构造方法

| 构造方法签名 [仅包含公共实例方法] | 注释 |
| :--- | :--- |
| `public MonoLifecycleProxy()` |  |

## 方法

### 所有方法签名总览

| 方法完整签名 |
| :--- | 
| `public AutoRemoveListenerHandle AddListener(MonoLifecycleEvent evt, Action callback, int order = 0)` |
| `public AutoRemoveListenerHandle RegisterAuto(object obj)` |
| `[Overload] public Component GetComponent(Type type)` |
| `[Overload] public Component GetComponent(string type)` |
| `[Overload] public Component GetComponentInChildren(Type t)` |
| `[Overload] public Component GetComponentInChildren(Type t, bool includeInactive)` |
| `[Overload] public Component GetComponentInParent(Type t)` |
| `[Overload] public Component GetComponentInParent(Type t, bool includeInactive)` |
| `public Component[] GetComponents(Type type)` |
| `[Overload] public Component[] GetComponentsInChildren(Type t)` |
| `[Overload] public Component[] GetComponentsInChildren(Type t, bool includeInactive)` |
| `[Overload] public Component[] GetComponentsInParent(Type t)` |
| `[Overload] public Component[] GetComponentsInParent(Type t, bool includeInactive)` |
| `[Overload] public Coroutine StartCoroutine(IEnumerator routine)` |
| `[Overload] public Coroutine StartCoroutine(string methodName)` |
| `[Overload] public Coroutine StartCoroutine(string methodName, object value)` |
| `public T GetComponent<T>()` |
| `[Overload] public T GetComponentInChildren<T>()` |
| `[Overload] public T GetComponentInChildren<T>(bool includeInactive)` |
| `[Overload] public T GetComponentInParent<T>()` |
| `[Overload] public T GetComponentInParent<T>(bool includeInactive)` |
| `public T[] GetComponents<T>()` |
| `[Overload] public T[] GetComponentsInChildren<T>()` |
| `[Overload] public T[] GetComponentsInChildren<T>(bool includeInactive)` |
| `[Overload] public T[] GetComponentsInParent<T>()` |
| `[Overload] public T[] GetComponentsInParent<T>(bool includeInactive)` |
| `public Type GetType()` |
| `public bool CompareTag(string tag)` |
| `[Overload] public bool IsInvoking()` |
| `[Overload] public bool IsInvoking(string methodName)` |
| `public bool TryGetComponent(Type type, out ref Component component)` |
| `public bool TryGetComponent<T>(out ref T component)` |
| `public int GetComponentIndex()` |
| `public int GetInstanceID()` |
| `public int GetListenerCount(MonoLifecycleEvent evt)` |
| `public override bool Equals(object other)` |
| `public override int GetHashCode()` |
| `public override string ToString()` |
| `[Overload] public void BroadcastMessage(string methodName)` |
| `[Overload] public void BroadcastMessage(string methodName, SendMessageOptions options)` |
| `[Overload] public void BroadcastMessage(string methodName, object parameter)` |
| `[Overload] public void BroadcastMessage(string methodName, object parameter, SendMessageOptions options)` |
| `[Overload] public void CancelInvoke()` |
| `[Overload] public void CancelInvoke(string methodName)` |
| `public void ClearAllListeners()` |
| `public void GetComponents(Type type, List<Component> results)` |
| `public void GetComponents<T>(List<T> results)` |
| `[Overload] public void GetComponentsInChildren<T>(List<T> results)` |
| `[Overload] public void GetComponentsInChildren<T>(bool includeInactive, List<T> result)` |
| `public void GetComponentsInParent<T>(bool includeInactive, List<T> results)` |
| `public void Invoke(string methodName, float time)` |
| `public void InvokeRepeating(string methodName, float time, float repeatRate)` |
| `public void RemoveListener(MonoLifecycleEvent evt, Action callback)` |
| `[Overload] public void SendMessage(string methodName)` |
| `[Overload] public void SendMessage(string methodName, SendMessageOptions options)` |
| `[Overload] public void SendMessage(string methodName, object value)` |
| `[Overload] public void SendMessage(string methodName, object value, SendMessageOptions options)` |
| `[Overload] public void SendMessageUpwards(string methodName)` |
| `[Overload] public void SendMessageUpwards(string methodName, SendMessageOptions options)` |
| `[Overload] public void SendMessageUpwards(string methodName, object value)` |
| `[Overload] public void SendMessageUpwards(string methodName, object value, SendMessageOptions options)` |
| `public void StopAllCoroutines()` |
| `[Overload] public void StopCoroutine(Coroutine routine)` |
| `[Overload] public void StopCoroutine(IEnumerator routine)` |
| `[Overload] public void StopCoroutine(string methodName)` |
| `public static AutoRemoveListenerHandle Register(object obj)` |
| `public static void Register(MonoBehaviour mono)` |
| `protected object MemberwiseClone()` |
| `protected virtual void Finalize()` |
| `protected virtual void OnAfterDeserialize()` |
| `protected virtual void OnBeforeSerialize()` |
| `public Coroutine StartCoroutine_Auto(IEnumerator routine)` |

### 声明的普通方法

| 普通方法名称 | 注释 |
| :--- | :--- | 
| `public AutoRemoveListenerHandle AddListener` | 添加生命周期事件监听，返回可自动移除的监听句柄。 |
| `public AutoRemoveListenerHandle RegisterAuto` | 快捷注册。扫描对象实现的所有 ICustomXXX 接口， 将对应方法自动注册到匹配的生命周期事件中，返回组合句柄。 |
| `public int GetListenerCount` | 获取指定事件当前的监听者数量 |
| `public void ClearAllListeners` | 清空所有事件的监听者 |
| `public void RemoveListener` | 移除指定事件的监听者 |
| `public static AutoRemoveListenerHandle Register` | 快捷注册（任意对象）。扫描实现的所有 ICustomXXX 接口， 将对应方法自动注册到匹配的生命周期事件中。 |
| `public static void Register` | 快捷注册（MonoBehaviour 专用）。扫描实现的所有 ICustomXXX 接口， 将对应方法自动注册到匹配的生命周期事件中，并绑定到目标 GameObject 的 OnDestroy 自动取消订阅。 |

### 继承的普通方法

| 普通方法名称 | 注释 | 声明方法的类 |
| :--- | :--- | :--- |
| `public Component GetComponent` |  | `UnityEngine.Component` |
| `public Component GetComponent` |  | `UnityEngine.Component` |
| `public Component GetComponentInChildren` |  | `UnityEngine.Component` |
| `public Component GetComponentInChildren` |  | `UnityEngine.Component` |
| `public Component GetComponentInParent` |  | `UnityEngine.Component` |
| `public Component GetComponentInParent` |  | `UnityEngine.Component` |
| `public Component[] GetComponents` |  | `UnityEngine.Component` |
| `public Component[] GetComponentsInChildren` |  | `UnityEngine.Component` |
| `public Component[] GetComponentsInChildren` |  | `UnityEngine.Component` |
| `public Component[] GetComponentsInParent` |  | `UnityEngine.Component` |
| `public Component[] GetComponentsInParent` |  | `UnityEngine.Component` |
| `public Coroutine StartCoroutine` |  | `UnityEngine.MonoBehaviour` |
| `public Coroutine StartCoroutine` |  | `UnityEngine.MonoBehaviour` |
| `public Coroutine StartCoroutine` |  | `UnityEngine.MonoBehaviour` |
| `public T GetComponent<T>` |  | `UnityEngine.Component` |
| `public T GetComponentInChildren<T>` |  | `UnityEngine.Component` |
| `public T GetComponentInChildren<T>` |  | `UnityEngine.Component` |
| `public T GetComponentInParent<T>` |  | `UnityEngine.Component` |
| `public T GetComponentInParent<T>` |  | `UnityEngine.Component` |
| `public T[] GetComponents<T>` |  | `UnityEngine.Component` |
| `public T[] GetComponentsInChildren<T>` |  | `UnityEngine.Component` |
| `public T[] GetComponentsInChildren<T>` |  | `UnityEngine.Component` |
| `public T[] GetComponentsInParent<T>` |  | `UnityEngine.Component` |
| `public T[] GetComponentsInParent<T>` |  | `UnityEngine.Component` |
| `public Type GetType` |  | `System.Object` |
| `public bool CompareTag` |  | `UnityEngine.Component` |
| `public bool IsInvoking` |  | `UnityEngine.MonoBehaviour` |
| `public bool IsInvoking` |  | `UnityEngine.MonoBehaviour` |
| `public bool TryGetComponent` |  | `UnityEngine.Component` |
| `public bool TryGetComponent<T>` |  | `UnityEngine.Component` |
| `public int GetComponentIndex` |  | `UnityEngine.Component` |
| `public int GetInstanceID` |  | `UnityEngine.Object` |
| `public override bool Equals` |  | `UnityEngine.Object` |
| `public override int GetHashCode` |  | `UnityEngine.Object` |
| `public override string ToString` |  | `UnityEngine.Object` |
| `public void BroadcastMessage` |  | `UnityEngine.Component` |
| `public void BroadcastMessage` |  | `UnityEngine.Component` |
| `public void BroadcastMessage` |  | `UnityEngine.Component` |
| `public void BroadcastMessage` |  | `UnityEngine.Component` |
| `public void CancelInvoke` |  | `UnityEngine.MonoBehaviour` |
| `public void CancelInvoke` |  | `UnityEngine.MonoBehaviour` |
| `public void GetComponents` |  | `UnityEngine.Component` |
| `public void GetComponents<T>` |  | `UnityEngine.Component` |
| `public void GetComponentsInChildren<T>` |  | `UnityEngine.Component` |
| `public void GetComponentsInChildren<T>` |  | `UnityEngine.Component` |
| `public void GetComponentsInParent<T>` |  | `UnityEngine.Component` |
| `public void Invoke` |  | `UnityEngine.MonoBehaviour` |
| `public void InvokeRepeating` |  | `UnityEngine.MonoBehaviour` |
| `public void SendMessage` |  | `UnityEngine.Component` |
| `public void SendMessage` |  | `UnityEngine.Component` |
| `public void SendMessage` |  | `UnityEngine.Component` |
| `public void SendMessage` |  | `UnityEngine.Component` |
| `public void SendMessageUpwards` |  | `UnityEngine.Component` |
| `public void SendMessageUpwards` |  | `UnityEngine.Component` |
| `public void SendMessageUpwards` |  | `UnityEngine.Component` |
| `public void SendMessageUpwards` |  | `UnityEngine.Component` |
| `public void StopAllCoroutines` |  | `UnityEngine.MonoBehaviour` |
| `public void StopCoroutine` |  | `UnityEngine.MonoBehaviour` |
| `public void StopCoroutine` |  | `UnityEngine.MonoBehaviour` |
| `public void StopCoroutine` |  | `UnityEngine.MonoBehaviour` |
| `protected object MemberwiseClone` |  | `System.Object` |
| `protected virtual void Finalize` |  | `System.Object` |
| `protected virtual void OnAfterDeserialize` |  | `Sirenix.OdinInspector.SerializedMonoBehaviour` |
| `protected virtual void OnBeforeSerialize` |  | `Sirenix.OdinInspector.SerializedMonoBehaviour` |
| `public Coroutine StartCoroutine_Auto` |  | `UnityEngine.MonoBehaviour` |

## 属性

### 声明的属性

| 属性签名 | 注释 |
| :--- | :--- |
| `public static MonoLifecycleProxy Instance { get; }` |  |

### 继承的属性

| 属性签名 | 注释 | 声明属性的类 | 
| :--- | :--- | :--- |
| `public CancellationToken destroyCancellationToken { get; }` |  | `UnityEngine.MonoBehaviour` |
| `public GameObject gameObject { get; }` |  | `UnityEngine.Component` |
| `public HideFlags hideFlags { get; set; }` |  | `UnityEngine.Object` |
| `public Transform transform { get; }` |  | `UnityEngine.Component` |
| `public bool enabled { get; set; }` |  | `UnityEngine.Behaviour` |
| `public bool isActiveAndEnabled { get; }` |  | `UnityEngine.Behaviour` |
| `public bool runInEditMode { get; set; }` |  | `UnityEngine.MonoBehaviour` |
| `public bool useGUILayout { get; set; }` |  | `UnityEngine.MonoBehaviour` |
| `public string name { get; set; }` |  | `UnityEngine.Object` |
| `public string tag { get; set; }` |  | `UnityEngine.Component` |
| `public Component animation { get; }` |  | `UnityEngine.Component` |
| `public Component audio { get; }` |  | `UnityEngine.Component` |
| `public Component camera { get; }` |  | `UnityEngine.Component` |
| `public Component collider { get; }` |  | `UnityEngine.Component` |
| `public Component collider2D { get; }` |  | `UnityEngine.Component` |
| `public Component constantForce { get; }` |  | `UnityEngine.Component` |
| `public Component hingeJoint { get; }` |  | `UnityEngine.Component` |
| `public Component light { get; }` |  | `UnityEngine.Component` |
| `public Component networkView { get; }` |  | `UnityEngine.Component` |
| `public Component particleSystem { get; }` |  | `UnityEngine.Component` |
| `public Component renderer { get; }` |  | `UnityEngine.Component` |
| `public Component rigidbody { get; }` |  | `UnityEngine.Component` |
| `public Component rigidbody2D { get; }` |  | `UnityEngine.Component` |

## Additional Notes

> 首个 `## Additional Notes` 是增量生成文档标识符，请勿修改标题级别和内容！本文档由 [`Aesir Inspector`](https://github.com/yuumixcode/Unity-Aesir-Packages) 辅助生成。
