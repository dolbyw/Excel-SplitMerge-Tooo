# Excel 拆分合并工具 (Tooo)

一个基于 Electron + React + TypeScript 开发的现代化桌面应用程序，专为高效处理 Excel 文件的拆分和合并操作而设计。

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

### 前端技术栈
- **React 18**: 用户界面框架
- **TypeScript**: 类型安全的 JavaScript 超集
- **Vite**: 现代化的前端构建工具
- **Tailwind CSS**: 实用优先的 CSS 框架
- **Electron**: 跨平台桌面应用开发框架

### 后端处理
- **Python**: 核心数据处理逻辑
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

#### Excel 格式保留
- 使用 `openpyxl` 库的 `copy_worksheet()` 方法
- 保留单元格样式、字体、颜色、边框等格式
- 维护列宽和行高设置
- 处理合并单元格和公式

#### 错误处理和用户反馈
- 完整的异常捕获和错误信息显示
- 实时进度更新和状态反馈
- 文件验证和格式检查

#### 性能优化
- 流式处理大文件，避免内存溢出
- 异步操作，保持 UI 响应性
- 进度条显示，提升用户体验

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

### 📦 便携版下载 (v1.0.2)

#### 🎉 最新版本：v1.0.3
- 🔗 **下载地址**：[GitHub Releases v1.0.3](https://github.com/dolbyw/Excel-SplitMerge-Tooo/releases/tag/v1.0.3)
- 📦 **文件名**：`Tooo-Portable-v1.0.3.zip`
- 💾 **文件大小**：约130MB
- 🖥️ **系统要求**：Windows 10/11 x64
- ✨ **特点**：解压即用，无需安装Python或其他依赖

#### 🆕 版本亮点 (v1.0.3)
- 🔧 **重要修复**：修复合并功能中源文件最后一行丢失的严重问题
- 📊 **日志增强**：大幅改进运行信息框的日志记录系统
- 🔍 **数据完整性**：添加详细的数据处理统计和验证功能
- 📦 **包管理优化**：迁移到pnpm，提升中国大陆开发体验
- 🚀 **性能提升**：优化数据处理逻辑，增强内存使用效率

### 🚀 快速开始
1. 访问 [Releases页面](https://github.com/dolbyw/Excel-SplitMerge-Tooo/releases/tag/v1.0.3)
2. 下载 `Tooo-Portable-v1.0.3.zip`
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
