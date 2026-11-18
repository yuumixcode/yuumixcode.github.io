---
date: 2026-11-18
slug: unity-yaml-merge-scene-conflict
authors:
  - yuumixcode
categories:
  - Unity
  - Git
  - 团队协作
description: 详解团结引擎智能合并的适用场景与价值，给出 TuanjieYAMLMerge 的 merge driver 与 mergetool 完整配置命令，并澄清 .asset 不该启用该合并的注意事项。
---

# 解决多人同时修改 Scene 的冲突问题｜UnityYAMLMerge

> 本文最后更新于 2026 年 11 月 18 日。

详解团结引擎智能合并的适用场景与价值，给出 TuanjieYAMLMerge 的 merge driver 与 mergetool 完整配置命令，并澄清 `.asset` 不该启用该合并的注意事项。

<!-- more -->

## 一、什么是智能合并

智能合并（Smart Merge）是 Unity 与团结引擎编辑器内置的一个能力，由 `UnityYAMLMerge` 工具提供。在团结引擎中，这个工具的可执行文件叫 `TuanjieYAMLMerge`，位于编辑器安装目录的 `Tools` 文件夹下。

它和普通文本合并的区别在于：普通的 Git 三方合并按“行”来拼接文件，而它理解 Unity 的 YAML 序列化结构——知道 `fileID`、GUID 引用、数组和对象层级是什么意思，因此能够按语义合并场景（`.unity`）、预制件（`.prefab`）和元数据文件（`.meta`）。

工具本身随编辑器安装，不需要额外下载。它的命令行入口接受 `merge` 子命令，并需要三个路径参数（共同祖先、己方版本、对方版本）。以本机安装路径为例：

```text
/Applications/Tuanjie/Hub/Editor/2022.3.62t18/Tuanjie.app/Contents/Tools/TuanjieYAMLMerge
```

## 二、什么时候使用它

只有在“多个人同时修改同一个场景或预制件文件”时，智能合并才会成为需要考虑的问题。

如果满足以下任一条件，通常不需要它：

- 只有一个人开发，场景和预制件不存在多人并发修改。
- 团队成员各管各的模块，不会碰同一个文件。
- 团队使用独占签出（文件锁），同一时刻只有一个人能编辑某个场景。

它的触发时机在 Git 执行合并的那一刻——比如合并分支、变基、拉取别人的提交。也就是说，它是“出事时才用”的保险，而不是日常开发需要时刻关注的东西。单人开发时，这套机制整个项目周期都不会出现。

## 三、为什么需要使用它

如果没有配置智能合并，Git 会把 `.unity` 和 `.prefab` 当作普通文本文件处理，按行做三方合并。这会产生三类后果。

**运气好的情况**：两个人改的是文件中相隔很远的部分，比如一个人加了立方体、另一个人在别处加了灯光，文本上互不重叠，Git 自动合并成功。但“文本没冲突”不等于“语义正确”——Unity YAML 中对象之间通过 `fileID` 和 GUID 互相引用，数组还有顺序，行级合并拼出的文件可能语法合法，引用关系却已经错位，直到进入编辑器才发现脚本丢失或组件指向了错误的对象。

**常见的情况**：两个人改了同一段落，Git 报 `CONFLICT (content)`，并在文件中写入 `<<<<<<<`、`=======`、`>>>>>>>` 冲突标记。这些标记不是合法的 YAML，双击场景时 Unity 会提示场景损坏、解析失败。此时必须手工清理标记，而文件里全是 `fileID: 8300001` 这类内容，人眼无法判断哪个是哪个物体，手工取舍极其痛苦。很多人最后选择丢弃一方的改动、照着记忆重做一遍。

**预制件的覆盖数据更脆弱**。场景中的预制件实例自带一份稀疏的修改列表，多个实例还可能共用同一个目标 `fileID`。两个人各改一部分覆盖数据，文本合并很容易拼出看似完整、实则错位或重复的结果，症状同样是引用丢失或改了 A 实例却影响 B 实例这类诡异问题。

还需要特别注意一个容易踩的坑：`.gitattributes` 里写 `merge=unityyamlmerge` 只是给文件打了一个标签，告诉 Git 遇到冲突时用哪个驱动。驱动的具体实现配置在每台机器的 Git config 里，而 Git config 不会随仓库提交。实测表明，驱动未配置时 Git 不报错，只是静默回退到普通文本合并——你会以为自己在用智能合并，实际上根本没有。

## 四、它有什么好处

配置智能合并之后，合并行为从“按行拼文本”变成“按 Unity 对象图合并”。

- 两个分支分别修改同一个场景里不同的物体时，能够可靠地把两处改动都保留下来，而不会产生引用错位。
- 改到同一个物体时，工具能自动解决一部分冲突，只有实在无法判断的部分才回退给外部可视化工具，人工介入的范围明显缩小。
- 场景文件不再因为冲突标记而变成无法打开的损坏文件，减少了丢弃改动重做的情况。
- 它和你使用的版本控制工具无关：Git 只要把可执行文件注册成合并驱动即可，不需要改用 Perforce 或 PlasticSCM。

在团结引擎环境中做过端到端验证：一个分支修改场景中立方体的名称，另一个分支修改灯光的名称，执行 `git merge` 后驱动被自动调用，两处改动都正确保留，没有产生冲突标记，合并提交干净完成。

## 五、怎么样去配置这个驱动

配置分为三部分：编辑器的项目设置、Git 的合并驱动、以及文件属性标签。

### 5.1 编辑器设置前提

在编辑器中确认两项设置，这是智能合并能够工作的基础。

- `Edit > Project Settings > Editor > Asset Serialization` 设为 `Force Text`，即强制文本序列化。二进制序列化的场景无法按 YAML 合并。
- `Version Control > Mode` 设为 `Visible Meta Files`，让 `.meta` 文件以可见文件形式纳入版本控制。

需要说明的是，很多文档提到在 `Edit > Project Settings > Version Control` 面板中选择第三方版本控制工具后才会显示 `Smart Merge` 下拉选项。这个下拉框只是编辑器内部的开关，只在编辑器通过 Perforce 或 PlasticSCM 解决冲突时起作用。使用 Git 时它不会出现，也不需要它——Git 走的是完全独立的配置路径，直接把可执行文件注册到 Git 即可。

### 5.2 配置 merge driver

merge driver 的作用是让 Git 在执行 `git merge` 时自动调用合并工具，无需额外步骤。以下为仓库级配置，只影响当前项目。

```text
git config --local merge.unityyamlmerge.name "Unity SmartMerge (TuanjieYAMLMerge)"
git config --local merge.unityyamlmerge.driver "'/Applications/Tuanjie/Hub/Editor/2022.3.62t18/Tuanjie.app/Contents/Tools/TuanjieYAMLMerge' merge --fallback none -h -p --force %O %B %A %A"
git config --local merge.unityyamlmerge.recursive binary
```

参数说明：`%O` 是共同祖先版本，`%B` 是对方版本，`%A` 是己方版本，最后的 `%A` 表示把合并结果写回己方文件。`-p` 表示先做预合并，`-h` 表示无界面运行，`--fallback none` 表示关闭外部回退工具，避免团队里突然弹出别人机器上的第三方合并软件。

路径中的版本号与实际安装的编辑器版本相关，需要根据自己的环境调整。如果使用的是官方 Unity 而非团结引擎，工具名为 `UnityYAMLMerge`，路径位于 Unity 安装目录的 `Tools` 文件夹下。

### 5.3 配置 mergetool

mergetool 用于手动触发，比如在命令行执行 `git mergetool`。它和上面的 driver 互不冲突，可以都配置。

```text
git config --local mergetool.unityyamlmerge.trustExitCode false
git config --local mergetool.unityyamlmerge.cmd "'/Applications/Tuanjie/Hub/Editor/2022.3.62t18/Tuanjie.app/Contents/Tools/TuanjieYAMLMerge' merge -p \"$BASE\" \"$REMOTE\" \"$LOCAL\" \"$MERGED\""
git config --local merge.tool unityyamlmerge
```

这里的 `$BASE`、`$REMOTE`、`$LOCAL`、`$MERGED` 是 Git 在冲突解决时提供的变量，分别对应共同祖先、对方版本、己方版本和输出结果。设置 `merge.tool` 为默认值后，直接执行 `git mergetool` 就会调用它。

### 5.4 设置 .gitattributes

在仓库根目录的 `.gitattributes` 中，为需要智能合并的文件打上标签。

```text
*.meta    text eol=lf merge=unityyamlmerge linguist-generated
*.unity   text eol=lf merge=unityyamlmerge linguist-generated
*.prefab  text eol=lf merge=unityyamlmerge linguist-generated
```

`text eol=lf` 保持文件为文本并统一换行符，`merge=unityyamlmerge` 指定驱动名称，`linguist-generated` 让 GitHub 在语言统计和差异显示中折叠这些生成文件。

需要特别强调的是，**不要给 `.asset`、`.mat`、`.controller` 这类文件加 `merge=unityyamlmerge`**。官方文档明确说明，该工具默认只合并 `.unity`、`.prefab`、`.meta` 三类文件。相关视频的作者也在简介中专门发布更正，要求从 `.gitattributes` 中移除 `.asset`。这类文件应当保持普通文本合并，光照数据和地形数据等二进制内容则应另行按 LFS 处理。

### 5.5 验证配置

用 `git config --local --get-regexp` 查看是否写入成功，用 `git check-attr merge -- 路径` 确认某个场景文件最终带上了 `merge: unityyamlmerge`。

最可靠的验证方式是做一次真实合并：在测试仓库中让两个分支分别修改同一个场景里的不同物体，执行 `git merge`，观察是否自动完成、两处改动是否都保留。如果合并结果中没有冲突标记，说明驱动确实生效了。

## 六、参考链接

- [团结引擎中文手册：智能合并](https://docs.unity.cn/cn/tuanjiemanual/Manual/SmartMerge.html)
- [Unity 官方手册：Smart merge](https://docs.unity.com/en-us/engine/6000.3/manual/get-started/project-configuration/version-control/smart-merge)
- [Unity 官方手册：SmartMerge（2022.2）](https://docs.unity3d.com/6000.2/Documentation/Manual/SmartMerge.html)
- [视频教程：Unity + Git in 2025：Smart Merge + Worktrees + Worktree Runner](https://www.youtube.com/watch?v=F0Qk-Cyw6PA)
