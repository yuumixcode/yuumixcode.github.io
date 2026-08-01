# Odin Inspector 入门与许可证

Odin Inspector and Serializer 是 Sirenix 开发的 Unity 编辑器扩展插件，三大核心能力：

- 提供 100+ **特性（Attribute）**快速增强 Inspector 面板显示。
- **扩展 Unity 原生序列化**，支持字典、委托等原生不支持的类型，由开源项目 Odin Serializer 提供。
- 提供一整套**自定义 Drawer 系统**，深度定制编辑器 GUI，功能非常强大。

## 许可证说明

### 一览表

| 类型 | 门槛 | 价格 / 方式 | 包含内容 |
| --- | --- | --- | --- |
| 试用 | 官网注册账号 | 免费 90 天 | 全功能 |
| Special | 满足特定条件（官网价格页查看） | 免费 | — |
| 学生计划 | Unity 学生资格 | 免费 | ⚠️ **中国大陆地区不可获取**（申请表单无 China 选项） |
| Personal | 近 12 个月收入 < 20 万美元 | 买断，官网常打折（约 25 美元，比资源商店便宜） | Odin Inspector + Serializer 的 **DLL 版本** |
| Enterprise | 近 12 个月收入 > 20 万美元 | 235 美元/年/席位，含永久回退许可证 | DLL + Validator + 三产品源码 |

### 官网可以免费试用 90 天

在你确定要购买 Odin Inspector 插件前，可以先在 [Odin Inspector 官网](https://odininspector.com/) 创建一个新账号，免费试用 90 天，你觉得不错后，再进行购买。

### 官网可以免费获取 Special 许可证

点击 [Odin Inspector 价格页面](https://odininspector.com/pricing)，选择 `Special`，查看是否满足相关条件。

### Unity 学生计划可以免费获取许可证

此方式有特定网页，首先要获得 Unity 学生计划资格，然后点击 [Unity 官方支持页面](https://support.unity.com/hc/en-us/articles/29430387545108-How-do-I-access-the-free-Odin-Inspector-and-Odin-Validator-educational-licenses)，进入特殊页面验证资格。

> ⚠️ **注意**：中国大陆地区目前不可以获取 Unity 学生计划。Unity 学生计划申请表单的 Country 没有 China、Chinese、Hong Kong 的选项。

### 个人或者小团队使用 Personal 许可证

- [Odin Inspector 官网价格页包含常见问题解答](https://odininspector.com/pricing)
- 过去 12 个月的收入或财务规模小于 20 万美元
- 使用 Personal 许可证，一次性付费，买断制
- 官网原价 50 美元，打折 25 美元；资源商店原价 55 美元，打折 27.5 美元
- **直接在官网购买更便宜**，同一时间打折，且经常打折，建议折扣价入手
- Unity 资源商店销售的版本为 Personal，**只包含 Odin Inspector and Serializer 插件的 DLL 版本**

> 如果超过了限制则需要购买商业版。商业版在个人版的基础上，增加了 Validator 插件（个人需要额外购买），Sirenix 公司三个产品的源代码，以及产品的永久回退许可证。

### 超过限制的团队使用 Enterprise 许可证

- 过去 12 个月的财务规模或收入大于 20 万美元
- 按年付费，席位订阅制，价格为 235 美元/年/席位
- 原则上，一个项目中任何一个席位都需要付费，包括美术工作人员
- 包含 Odin Inspector and Serializer DLL 版本、Odin Validator，以及 Odin Inspector and Serializer 源代码
- 拥有**永久回退许可证**：如果觉得后续更新不值得付费，可以使用永久回退许可证

---

## 在 Unity 资源商店购买后，通过订单号获取官网许可证

在资源商店购买插件后，使用订单号在官网进行验证，以后可以在官网获取独立的插件包。

- 官网版本会比资源商店版本更新稍快
- 目前只有官网才可以下载 Beta 版本

---

## Odin Inspector 和 Rider 达成合作

Odin Inspector 的使用过程中会使用字符串，有时候没有引用标识很容易出错，Rider 针对此项问题和 Odin Inspector 的开发团队 Sirenix 达成合作，在 **Rider 2024.1 版本**中开始实装。

所以如果你进行 Unity 开发，使用 Odin Inspector，且几乎不进行其他语言的工作，那么**非常推荐使用 Rider**。

- [Rider 2024.1 的版本变化](https://www.jetbrains.com/zh-cn/rider/whatsnew/2024-1/#version-2024-1-game-development)
- [Rider 关于 Odin Inspector 合作的博客](https://blog.jetbrains.com/dotnet/2024/03/20/sirenix-s-odin-inspector-support-comes-to-rider-a-jetbrains-ide/)

---

## Odin Inspector 宣布支持团结引擎（Tuanjie）

团结引擎是基于 Unity 2022 LTS 版本的特供版，未来中国开发者可以继续使用 Odin Inspector。

- Odin Inspector 官方安排了工作人员参加 Unite 2025
- Odin Inspector Patch Notes 4.0 包含针对 Tuanjie 的更新

---

## 参考资料链接

- [Immediate-Mode Graphical User Interfaces (2005)](https://caseymuratori.com/blog_0001)
- [深入了解 IMGUI 和编辑器定制](https://unity.com/blog/engine-platform/imgui-and-editor-customization)
- [Unity-Articles/IMGUI crash course](https://github.com/Bunny83/Unity-Articles/blob/master/IMGUI%20crash%20course.md)
- [Unity - Manual: Immediate Mode GUI (IMGUI)](https://docs.unity3d.com/2022.3/Documentation/Manual/GUIScriptingGuide.html)