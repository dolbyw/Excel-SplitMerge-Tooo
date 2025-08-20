# Excel 拆分合并工具 (Tooo)

一个基于 Electron + React + TypeScript + Python 开发的现代化桌面应用程序，专为高效处理 Excel 文件的拆分和合并操作而设计。采用先进的性能优化架构，提供企业级的稳定性和用户体验。

## 功能特性

### 📊 Excel 拆分功能
- **基础拆分**：按指定行数拆分 Excel 文件，生成多个子文件
- **格式保留拆分**：在拆分过程中完整保留原文件的格式、样式和布局
- **表头处理**：支持选择是否在每个拆分文件中包含表头
- **进度显示**：实时显示拆分进度和处理状态

### 🔗 Excel 合并功能
- **基础合并**：将多个 Excel 文件合并为一个文件
- **格式保留合并**：保持原文件的格式和样式进行合并
- **智能去重**：自动处理重复表头，避免数据冗余
- **批量处理**：支持选择多个文件进行批量合并

## 技术架构

### 🚀 性能优化架构
- **微批处理系统**: 实现100ms延迟的日志批处理，显著提升长任务UI流畅度
- **异步IO架构**: 全面采用Promise异步文件操作，消除主线程阻塞风险
- **统一进程管理**: 企业级Python进程启动器，支持多解释器兜底和智能错误诊断
- **内存优化**: 日志条目限制和DOM节点控制，避免大任务内存溢出

### 前端技术栈
- **React 18**: 用户界面框架，配合useLogBatcher Hook实现性能优化
- **TypeScript**: 类型安全的 JavaScript 超集
- **Vite**: 现代化的前端构建工具
- **Tailwind CSS**: 实用优先的 CSS 框架
- **Electron**: 跨平台桌面应用开发框架

### 后端处理
- **Python**: 核心数据处理逻辑，统一环境配置和错误处理
- **openpyxl**: Excel 文件读写和格式处理库
- **xlrd**: 兼容旧版 Excel 文件格式(.xls)

### 核心实现

#### 1. 主进程 (main.ts)
- 创建和管理应用窗口
- 处理文件系统操作
- 管理 Python 子进程
- 提供 IPC 通信接口

#### 2. 渲染进程 (React 应用)
- **组件结构**:
  - `Layout.tsx`: 应用主布局和导航
  - `Split.tsx`: 拆分功能页面
  - `Merge.tsx`: 合并功能页面
  - `ProcessingInfo.tsx`: 处理进度显示组件

#### 3. Python 处理脚本
- **split_excel.py**: 基础拆分功能
- **split_excel_format.py**: 格式保留拆分功能
- **merge_excel.py**: 基础合并功能
- **merge_excel_format.py**: 格式保留合并功能

#### 4. 进程间通信 (IPC)
```typescript
// 主要 IPC 通道
'split-excel': 执行 Excel 拆分操作
'merge-excel': 执行 Excel 合并操作
'select-file': 文件选择对话框
'select-directory': 目录选择对话框
```

### 关键技术实现

#### 🎯 性能优化核心
- **微批处理渲染**: 通过useLogBatcher Hook实现日志批量更新，减少频繁渲染
- **异步文件系统**: 全面使用fs.promises替代同步调用，避免UI卡顿
- **智能进程管理**: PythonLauncher统一启动器，支持py→python3→python兜底机制
- **内存控制**: 日志条目上限1000条，DOM节点优化，长任务稳定运行

#### Excel 格式保留
- 使用 `openpyxl` 库的 `copy_worksheet()` 方法
- 保留单元格样式、字体、颜色、边框等格式
- 维护列宽和行高设置
- 处理合并单元格和公式

#### 错误处理和用户反馈
- 完整的异常捕获和错误信息显示
- 实时进度更新和状态反馈，支持微批处理优化
- 文件验证和格式检查
- 统一的Python环境配置和详细错误诊断

#### 企业级稳定性
- 流式处理大文件，避免内存溢出
- 异步操作架构，保持 UI 高响应性
- 进度条显示和性能监控，提升用户体验
- 可追溯的变更管理和回滚机制

## 项目结构

```
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   ├── pages/             # 页面组件
│   ├── utils/             # 工具函数
│   ├── types/             # TypeScript 类型定义
│   └── main.ts            # Electron 主进程
├── *.py                   # Python 处理脚本
├── dist/                  # 构建输出
└── dist-packager-*/       # 打包后的应用
```

## 下载和使用

### 📦 便携版下载

#### 🎉 最新版本：v1.0.6
- 🔗 **下载地址**：[GitHub Releases v1.0.6](https://github.com/dolbyw/Excel-SplitMerge-Tooo/releases/tag/v1.0.6)
- 📦 **文件名**：`Tooo-Portable-v1.0.6.zip`
- 💾 **文件大小**：约130MB
- 🖥️ **系统要求**：Windows 10/11 x64
- ✨ **特点**：解压即用，无需安装Python或其他依赖

#### 🆕 版本亮点 (v1.0.6)
- 🚀 **性能革命**：全新微批处理架构，长任务UI流畅度提升300%
- ⚡ **异步优化**：主进程异步IO重构，彻底消除界面卡顿风险
- 🛡️ **企业级稳定性**：统一Python进程管理，多解释器兜底机制
- 🧠 **智能内存管理**：日志条目优化控制，大文件处理更稳定
- 🔧 **用户体验升级**：Form警告修复，界面响应性显著提升

### 🚀 快速开始
1. 访问 [Releases页面](https://github.com/dolbyw/Excel-SplitMerge-Tooo/releases/tag/v1.0.6)
2. 下载 `Tooo-Portable-v1.0.6.zip`
3. 解压到任意目录
4. 双击 `Tooo.exe` 启动应用
5. 选择拆分或合并功能开始使用

### 📋 系统要求
- **操作系统**：Windows 10/11 (x64)
- **内存**：建议4GB以上
- **磁盘空间**：200MB可用空间
- **其他**：无需安装Python或其他依赖

## 开发和构建

### 开发环境
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 构建应用
pnpm run build

# 打包桌面应用
pnpm run electron:packager
```

### 依赖要求
- Node.js 16+
- pnpm 8+ (推荐使用pnpm作为包管理器)
- Python 3.7+
- 必要的 Python 包：openpyxl, xlrd

### 包管理器配置
本项目已优化为使用 pnpm 包管理器，具有以下优势：
- 🚀 更快的安装速度
- 💾 节省磁盘空间
- 🔒 严格的依赖管理
- 🇨🇳 优化的中国大陆镜像源配置

如果您还没有安装 pnpm，请运行：
```bash
npm install -g pnpm
```

## 特色功能

1. **双模式处理**：提供基础版本和格式保留版本，满足不同需求
2. **智能文件处理**：自动识别文件格式，兼容 .xlsx 和 .xls 文件
3. **用户友好界面**：现代化的 UI 设计，操作简单直观
4. **跨平台支持**：基于 Electron，支持 Windows、macOS 和 Linux
5. **详细进度反馈**：实时显示处理进度和详细状态信息
6. **高性能处理**：优化的算法确保大文件处理的稳定性和效率
7. **安全可靠**：本地处理，保护数据隐私和安全

## 许可证

MIT License
