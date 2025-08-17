# Excel处理工具桌面应用 - 技术架构文档

## 1. Architecture design

```mermaid
graph TD
    A[用户界面 - React Frontend] --> B[Electron Main Process]
    B --> C[Python Script Bridge]
    C --> D[Excel Processing Scripts]
    C --> E[File System Operations]
    
    subgraph "Frontend Layer"
        A
    end
    
    subgraph "Desktop Application Layer"
        B
        C
    end
    
    subgraph "Processing Layer"
        D
        E
    end
    
    subgraph "External Dependencies"
        F[Python Runtime]
        G[pandas & openpyxl]
    end
    
    D --> F
    D --> G
```

## 2. Technology Description

* Frontend: React\@18 + TypeScript + Ant Design + Electron Renderer

* Desktop Framework: Electron\@latest

* Backend Bridge: Node.js + child\_process (调用Python脚本)

* Python Runtime: Python 3.8+ (打包到应用中)

* Python Dependencies: pandas + openpyxl

* Build Tools: Webpack + Electron Builder

* Package Manager: npm

## 3. Route definitions

| Route     | Purpose               |
| --------- | --------------------- |
| /home     | 主界面，显示功能选择和基本操作       |
| /split    | Excel拆分功能页面，文件选择和参数配置 |
| /merge    | Excel合并功能页面，目录选择和输出设置 |
| /progress | 进度显示页面，实时显示处理状态和日志    |
| /settings | 设置页面，应用配置和默认参数        |

## 4. API definitions

### 4.1 Core API

Electron IPC通信接口

**文件选择相关**

```typescript
// 选择Excel文件
ipcRenderer.invoke('select-excel-file')
// 返回: { filePath: string, canceled: boolean }

// 选择目录
ipcRenderer.invoke('select-directory')
// 返回: { dirPath: string, canceled: boolean }
```

**Excel处理相关**

```typescript
// 拆分Excel文件
ipcRenderer.invoke('split-excel', {
  inputFile: string,
  outputDir: string,
  rowsPerFile: number,
  preserveFormat: boolean
})
// 返回: { success: boolean, message: string, outputFiles: string[] }

// 合并Excel文件
ipcRenderer.invoke('merge-excel', {
  inputDir: string,
  outputFile: string,
  preserveFormat: boolean
})
// 返回: { success: boolean, message: string, outputFile: string }
```

**进度监听**

```typescript
// 监听处理进度
ipcRenderer.on('processing-progress', (event, data) => {
  // data: { progress: number, message: string, type: 'info' | 'error' | 'success' }
})
```

### 4.2 Python脚本调用接口

**拆分脚本调用**

```bash
python split_excel.py --input "input.xlsx" --output "output_dir" --rows 1000
python split_excel_format.py --input "input.xlsx" --output "output_dir" --rows 1000
```

**合并脚本调用**

```bash
python merge_excel.py --input_dir "input_dir" --output_file "output.xlsx"
python merge_excel_format.py --input_dir "input_dir" --output_file "output.xlsx"
```

## 5. Server architecture diagram

```mermaid
graph TD
    A[React UI Components] --> B[Electron Renderer Process]
    B --> C[IPC Communication]
    C --> D[Electron Main Process]
    D --> E[Python Script Manager]
    E --> F[Child Process Spawner]
    F --> G[Python Scripts]
    
    subgraph "Frontend Process"
        A
        B
    end
    
    subgraph "Main Process"
        D
        E
        F
    end
    
    subgraph "Python Runtime"
        G
    end
```

## 6. Data model

### 6.1 Data model definition

```mermaid
erDiagram
    APPLICATION_CONFIG {
        string defaultOutputDir
        number defaultRowsPerFile
        boolean defaultPreserveFormat
        string pythonPath
    }
    
    PROCESSING_JOB {
        string id
        string type
        string status
        string inputPath
        string outputPath
        number progress
        string[] logs
        datetime createdAt
        datetime completedAt
    }
    
    FILE_INFO {
        string path
        string name
        number size
        datetime lastModified
        string type
    }
```

### 6.2 Data Definition Language

**应用配置存储 (JSON文件)**

```json
{
  "defaultOutputDir": "C:\\Users\\Username\\Documents\\ExcelOutput",
  "defaultRowsPerFile": 1000,
  "defaultPreserveFormat": false,
  "pythonPath": "./python/python.exe",
  "recentFiles": [
    {
      "path": "C:\\path\\to\\file.xlsx",
      "lastUsed": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**处理任务状态管理 (内存中)**

```typescript
interface ProcessingJob {
  id: string;
  type: 'split' | 'merge';
  status: 'pending' | 'running' | 'completed' | 'error';
  inputPath: string;
  outputPath: string;
  progress: number; // 0-100
  logs: string[];
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}
```

**文件信息结构**

```typescript
interface FileInfo {
  path: string;
  name: string;
  size: number;
  lastModified: Date;
  type: 'xlsx' | 'directory';
  isValid: boolean;
}
```

### 6.3 打包和部署配置

**Electron Builder配置**

* 目标平台: Windows (win32, x64)

* 打包格式: NSIS安装包 (.exe)

* 包含Python运行时和依赖库

* 自动更新支持

* 代码签名配置

**Python环境打包**

* 使用PyInstaller将Python脚本打包为可执行文件

* 包含pandas和openpyxl依赖

* 集成到Electron应用资源中

