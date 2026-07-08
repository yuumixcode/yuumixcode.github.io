# Aesir Inspector

[English](https://github.com/yuumixcode/aesir-inspector/blob/main/Documentation~/en/README.md) | [![license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/yuumixcode/aesir-inspector/blob/main/LICENSE.md)

GitHub 仓库：<https://github.com/yuumixcode/aesir-inspector>

`Aesir Inspector` 是一个 Unity 编辑器扩展库，旨在提供双语 Inspector UI、安全编辑器工具集、脚本文档生成器等功能。**可选集成 Odin Inspector** 以获得增强的 Inspector 渲染和样式优化。

> **💡 关于 Odin Inspector 的依赖**：Odin Inspector 是本项目的**可选依赖**。核心功能（Summary 工具、安全编辑器工具、文档生成器运行时等）不依赖 Odin，可在无 Odin 环境下正常编译和运行。安装 Odin Inspector 后会自动添加 `ODIN_INSPECTOR` 编译符号，启用 OdinIntegration 增强程序集，提供双语特性装饰器、Attribute Drawer、Processor 等增强功能。

## 适用人群

- **编辑器工具开发者**：正在开发自定义 Inspector 工具，需要双语（中/英）UI 显示支持。
- **跨国/跨地区协作团队**：需要在 Inspector 面板中同时展示中英文信息以降低沟通成本。
- **Unity 编辑器用户**：希望获得安全编辑器工具、文档生成器、Summary 同步工具等实用功能，无需安装 Odin Inspector。
- **Odin Inspector 用户**：已有 Odin Inspector 并希望获得更丰富的属性装饰器与增强 Inspector 体验。
- **代码规范倡导者**：希望团队遵循统一的代码风格与注释标准，提升项目可维护性。

## 安装说明

### 通过 Git URL 安装

1. 打开 Unity Package Manager 窗口。
2. 点击左上角的 `+` 按钮，选择 `Add package from git URL...`。
3. 输入以下地址：

```
https://github.com/yuumixcode/aesir-inspector.git
```

### 通过 manifest.json 安装

在项目的 `Packages/manifest.json` 文件中添加：

```json
{
  "dependencies": {
    "cn.runlab.aesir-inspector": "https://github.com/yuumixcode/aesir-inspector.git"
  }
}
```

### 安装方式检测

Aesir Inspector 会在编辑器加载时自动检测安装方式（UPM / Assets 目录），并通过 `AesirInspectorInstallationChecker` 暴露静态属性：

- `InstallMode`：当前安装方式（`Upm` / `AssetFolder` / `Unknown`）。
- `IsUpm`：是否通过 UPM 安装。
- `IsAssetFolder`：是否安装在 Assets 目录中（Asset Store 导入或 Git 子模块）。

## 环境依赖

- **Unity**: 2022.3.2t3 (Tuanjie) 或更高版本。
- **Odin Inspector**: 3.3.x 或更高版本（可选依赖；导入后会自动添加 `ODIN_INSPECTOR` 编译符号，启用 OdinIntegration 增强程序集）。

## 核心功能速览

> **📌 提示**：标注 ⚡ 的功能需要安装 Odin Inspector。

### 1. 特性总览 (Attribute Overview Pro) ⚡

以可搜索的树形菜单展示所有已注册的 Odin Inspector 与 Aesir Inspector 特性面板，每个特性提供实时预览与示例代码。

- **分类浏览**：按 Essentials / Buttons / Collections / Groups / Conditionals 等分类浏览特性。
- **搜索定位**：支持模糊搜索，快速找到目标特性。
- **实时预览**：选中特性即可在右侧面板查看效果与参数配置。
- **代码预览**：选中特性即可查看对应的示例源代码。
- 通过 `Tools → Aesir → Inspector → Attribute Overview Pro` 菜单打开。

### 4. 迷你工具集 (Mini Tools) ⚡

整合常用编辑器小工具，通过 `Tools → Aesir → Inspector → Mini Tools` 菜单打开统一窗口。

| 工具 | 说明 |
|------|------|
| **MenuItem Viewer** | 搜集并展示项目中所有 `[MenuItem]` 菜单项信息，支持按程序集过滤、搜索 |
| **Syntax Highlighter** | 基于 Odin 内置语法高亮处理器的可视化面板，输入源码即可测试高亮效果并输出富文本标记 |
| **Quick Create SO** | 在 Project 窗口右键 MonoScript 即可快速生成 ScriptableObject 资源文件，支持多选批量创建 |

### 5. 扩展包管理器 (Extension Package Manager) ⚡

快捷安装推荐的 Aesir 系列和其他常用开源 Unity Packages，基于 Git URL 方式。

- **一键安装/移除**：卡片式 UI 展示推荐包的安装状态，点击即可安装或移除。
- **自动检测**：打开窗口时自动检测已安装包的状态，安装/移除后实时刷新。
- 通过 `Tools → Aesir → Inspector → Extension Package Manager` 菜单打开。

> 更深入的单功能文档见：[脚本文档生成器](script-doc-generator.md) · [Summary 工具](summary-tool.md) · [双语 UI 与 Odin 桥接](bilingual-odin.md) · [安全编辑器工具](safe-utilities.md) · [使用示例](examples.md)。
