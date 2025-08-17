# Excel 拆分合并工具 (Tooo)

一个基于 Electron + React + TypeScript 开发的桌面应用程序，用于 Excel 文件的拆分和合并操作。

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

## 开发和构建

### 开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建应用
npm run build

# 打包桌面应用
npm run package
```

### 依赖要求
- Node.js 16+
- Python 3.7+
- 必要的 Python 包：openpyxl, xlrd

## 特色功能

1. **双模式处理**：提供基础版本和格式保留版本，满足不同需求
2. **智能文件处理**：自动识别文件格式，兼容 .xlsx 和 .xls 文件
3. **用户友好界面**：现代化的 UI 设计，操作简单直观
4. **跨平台支持**：基于 Electron，支持 Windows、macOS 和 Linux
5. **详细进度反馈**：实时显示处理进度和详细状态信息

## 许可证

MIT License
