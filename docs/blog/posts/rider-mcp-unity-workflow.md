---
date: 2026-11-14
slug: rider-mcp-unity-workflow
authors:
  - yuumixcode
categories:
  - Unity
  - Rider
  - MCP
  - 开发工具
description: Rider 2025.2 起内置 MCP Server，把 IDE 的 C# 语义诊断、跨解决方案重构、构建与调试能力直接暴露给 AI 客户端，把 Unity 编译等待从分钟级压到秒级。
---

![Rider MCP 加速 Unity 开发封面](../assets/covers/cover-rider-mcp.png)

# Rider 内置 MCP 实战：把 Unity 编译等待从分钟压到秒

> Rider 2025.2 起内置 MCP Server，零安装即可把 IDE 能力接给 AI 客户端；配上正确的项目 header，Unity 编译等待从分钟级降到秒级。

<!-- more -->

## 一、为什么值得接

写 Unity C# 的循环很慢：改一行代码 → Unity 域重载 → 编译 → 回 Console 看报错。单次 20~60 秒，AI 写代码时这个循环会被放大几十倍。

Rider 从 **2025.2** 起内置了 MCP Server，把 IDE 的能力直接暴露给外部 AI 客户端（Claude Code、Codex、Cursor、VS Code 等都可以）。接上之后，AI 不必等 Unity 编译，直接问 IDE：

- `get_file_problems` — ReSharper 级语法/语义诊断，秒级返回
- `search_symbol` / `get_symbol_info` — 走 IDE 索引，不是文本 grep
- `rename_refactoring` / `change_api_signature` / `extract_method` — 跨解决方案语义重构，会同步改 override、实现与调用点
- `build_solution_start` — 直接触发 Rider 构建并回收问题列表
- `xdebug_attach_to_process` — 附加到 Unity 进程下断点

JetBrains 官方那个 `@jetbrains/mcp-proxy` npm 包已经弃用，能力全部并入 IDE，**不需要安装任何额外依赖**。

## 二、开启服务端

`设置 → 工具 → MCP 服务器`，勾选「启用 MCP 服务器」。

勾上后页面会显示两个地址（端口每次启动由 IDE 分配，以界面显示为准）：

```text
http://127.0.0.1:<端口>/sse        ← SSE
http://127.0.0.1:<端口>/stream     ← Streamable HTTP
```

两个都能用，但**优先选** `/stream`。SSE 需要维持一条长连接、再用 `sessionId` 拼出 POST 端点，容错差；Streamable HTTP 是单请求-响应模型，客户端实现更稳。

顺带记一个坑：这版 IDE 的内置服务路径是 `/stream`，不是 `/mcp`。按惯例去探 `/mcp` 会得到 404，容易误判成「不支持 HTTP 传输」。

## 三、拿到客户端配置（关键一步）

同一页面往下滚，有「手动客户端配置」，三个按钮：`复制 SSE 配置`、`复制 Stdio 配置`、`复制 HTTP 流配置`。

点 `复制 HTTP 流配置`，得到：

```json
{
  "type": "streamable-http",
  "url": "http://127.0.0.1:<端口>/stream",
  "headers": {
    "IJ_MCP_SERVER_PROJECT_PATH": "<你的项目绝对路径>"
  }
}
```

**这个 header 是全文最重要的一行**，原因见下一节。

## 四、最容易踩的坑：没有 header 就不认项目

只填 URL 的时候，每个工具调用都会返回：

```text
Unable to determine the target project for the current MCP tool call.
```

哪怕 IDE 里只开着一个项目也一样——它不会猜。两种解法：

1. 每次调用带 `rootFolder` 参数（工具 schema 里有，但需要调用方记得，AI 很容易漏）；
2. 配 `IJ_MCP_SERVER_PROJECT_PATH` header，让服务端知道默认项目。

实测第 2 种：带上 header 后调 `get_solution_projects` 且**不传** `rootFolder`，正常返回解决方案里的全部程序集列表。所以直接用设置页复制出来的那份配置，不要手写。

## 五、接进不同客户端

服务端是标准 MCP over HTTP，客户端只要支持 Streamable HTTP 即可。把设置页复制出来的那段 JSON 填进各家的 MCP 配置就行。

以 Codely / 团结 Cowork 为例，用 CLI 注册（比手改文件可靠，会写进客户端能识别的配置存储）：

```bash
codely mcp add rider "http://127.0.0.1:<端口>/stream" \
  --transport http \
  --scope project \
  -H "IJ_MCP_SERVER_PROJECT_PATH: <项目绝对路径>"
```

验证：

```text
$ codely mcp list
✓ rider: http://127.0.0.1:<端口>/stream (http) - Connected
```

### 配在全局还是项目级？

这是接入时最容易被忽略的设计问题。先把两个维度拆开：

| 维度 | 由谁决定 | 粒度 |
| --- | --- | --- |
| **端点**（URL / 端口） | IDE 进程 | 每个 IDE 实例一个 |
| **目标项目** | `IJ_MCP_SERVER_PROJECT_PATH` header 或 `rootFolder` 参数 | 每次调用 |

它们正交。MCP 服务端是**一个 IDE 进程**，端口属于这个进程，而「操作哪个项目」是调用期才决定的。所以：

- **全局条目 + 带 header**：条目被钉死在那一个项目上。实测把 header 指向一个没打开的项目，调用直接返回 `Unable to determine the target project ... Currently open projects: [...]`，**不会回退**到当前唯一打开的项目。也就是说这种配法换项目就失效。
- **全局条目 + 不带 header**：条目对所有项目通用，但要求调用方**每次**传 `rootFolder`（实测有效）。AI 漏传就会撞上同一条报错。
- **项目级条目 + 带 header**：按构造就是对的——只在打开该项目时加载，且不用依赖调用方记得传参。

结论：**服务定义适合放全局（它是 IDE 级事实），项目归属适合放在项目级配置里。** 现实里最省事的组合是「项目级条目 + header」；只有在你确定客户端每次都会带 `rootFolder` 时，才适合「全局条目 + 无 header」。

还有一个前提要认清：这个服务是**本机进程 + 本机端口**，条目一旦提交进版本库，对同事无效、还会让配置文件长期变脏。项目级配置要么保持本地未提交，要么把该文件排除出版本库。

另外，同时开两个 Rider 窗口会是两个端口；如果只想让其中一个窗口被 AI 操作，全局条目就只能指向那个端口。

## 六、端口会变，怎么稳住

端口没有 UI 配置项，IDE 每次启动取一个空闲端口。三个办法：

### 办法一（推荐）：读 IDE 写下的端口

macOS：

```bash
cat ~/Library/Caches/JetBrains/Rider<版本>/aia/bundledHooks/mcp-port
```

拿到端口后重跑一次 `codely mcp add`（同名是幂等更新）。

### 办法二：钉住端口

IDE 里 `Cmd+Shift+A` → `Registry` → 找 `idea.mcp.server.force.port`，填固定值后重启 Rider。这个键在 `McpServerService` 中对应 `getForcedMcpServerPortOrNull`，是官方实现，只是没暴露到设置界面。

### 办法三：用 Stdio 配置？

设置页确实提供 `复制 Stdio 配置`。但要注意，它的命令行里同样带端口参数（`createStdioMcpServerCommandLine(int, ...)`），**并不能**摆脱端口依赖，只是换了传输方式。别指望它一劳永逸。

## 七、和 Unity 侧工具的分工

| 工具 | 擅长 | 别用它做什么 |
| --- | --- | --- |
| Rider MCP | C# 语义分析、跨解决方案重构、构建、调试器、Profiler 采样 | 场景 / prefab / 资产操作 |
| Unity MCP（Editor Bridge） | 场景、prefab、资产、Play Mode 运行时 | 代码语义分析 |
| Unity 工程索引类工具 | 引用关系、脚本绑定、层级图查询 | 改代码 |

三者不重叠，串起来才闭环：**Rider 保证代码正确，Unity 侧保证运行正确**。

## 八、安全边界

- 服务只监听 `127.0.0.1`，本机之外访问不到；
- 它**会改你的代码**：`rename_refactoring`、`apply_patch`、`execute_terminal_command`、`build_solution_start` 都是写操作；
- 设置页里有「无需确认即可运行 shell 命令或运行配置（Brave 模式）」，默认关闭。**建议保持关闭**，让每个写操作都过一遍确认；
- 端口上另有 IDE 自身 AI 助手用的那条服务（另一端口、带 `IJ_MCP_AUTH_TOKEN` 鉴权），和这条对外的是两回事，别配混。

## 九、实战示例：修一个编译错误

以前：改代码 → 回 Unity → 等编译 → 读 Console。

接上 MCP 之后：

1. AI 写完代码，直接调 `get_file_problems("Assets/Scripts/Foo.cs")`；
2. 返回 ReSharper 的诊断（错误 / 警告 / 行号），当场改；
3. 需要整体状态时调 `get_project_problems`；
4. 确认干净了再回 Unity 编译一次。

一次修完，Unity 只编译一次。多文件改动用 `lint_files` 批量查，比逐个文件快得多。

重构同理：要给接口方法加一个参数，用 `change_api_signature`，它会列出受影响的文件、调用点、override 与实现，还支持先 `preview` 看影响面再落地——这是文本搜索替换做不到的。

## 十、小结

- Rider 2025.2+ 内置 MCP，零安装；
- 端点用 `/stream`（Streamable HTTP），`/mcp` 是 404；
- **配置必须带** `IJ_MCP_SERVER_PROJECT_PATH` **header**，否则工具全部拒绝执行；
- 端口每次启动会变，读 IDE 的端口文件或用 Registry 键钉死；
- 定位是「C# 语义层」，和 Unity 侧的 MCP 互补而非替代。

如果你的 AI 工作流里最痛的一环是「等 Unity 编译」，这条通路能把这段等待从分钟级压到秒级，值得花十分钟配一次。
