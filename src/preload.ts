import { contextBridge, ipcRenderer } from "electron";

// 定义API接口类型
interface ElectronAPI {
  // 文件选择相关
  selectExcelFile: () => Promise<{ success: boolean; filePath?: string; fileName?: string; message?: string }>;
  selectDirectory: () => Promise<{ success: boolean; dirPath?: string; dirName?: string; message?: string }>;
  selectSaveFile: () => Promise<{ success: boolean; filePath?: string; fileName?: string; message?: string }>;

  // Excel处理相关
  splitExcel: (options: {
    inputFile: string;
    outputDir: string;
    rowsPerFile: number;
    preserveFormat: boolean;
    copyHeaders: boolean;
  }) => Promise<{
    success: boolean;
    message: string;
    outputFiles: string[];
  }>;

  mergeExcel: (options: {
    inputDir: string;
    outputFile: string;
    preserveFormat: boolean;
    removeDuplicateHeaders: boolean;
  }) => Promise<{
    success: boolean;
    message: string;
    outputFile: string;
  }>;

  // 进度监听
  onProcessingProgress: (
    callback: (data: {
      progress: number;
      message: string;
      type: "info" | "error" | "success";
    }) => void,
  ) => void;

  removeProcessingProgressListener: () => void;

  // 配置管理
  getAppConfig: () => Promise<{
    defaultOutputDir: string;
    defaultSplitOutputDir: string;
    defaultMergeOutputDir: string;
    defaultRowsPerFile: number;
    defaultPreserveFormat: boolean;
    recentFiles: Array<{
      path: string;
      lastUsed: string;
    }>;
  }>;

  saveAppConfig: (config: {
    defaultOutputDir: string;
    defaultSplitOutputDir: string;
    defaultMergeOutputDir: string;
    defaultRowsPerFile: number;
    defaultPreserveFormat: boolean;
    recentFiles: Array<{
      path: string;
      lastUsed: string;
    }>;
  }) => Promise<{ success: boolean; error?: string }>;

  // 默认输出目录管理
  ensureDefaultOutputDirs: () => Promise<{
    success: boolean;
    splitDir?: string;
    mergeDir?: string;
    error?: string;
  }>;
}

// 暴露安全的API到渲染进程
contextBridge.exposeInMainWorld("electronAPI", {
  // 文件选择相关
  selectExcelFile: () => ipcRenderer.invoke("select-excel-file"),
  selectDirectory: () => ipcRenderer.invoke("select-directory"),
  selectSaveFile: () => ipcRenderer.invoke("select-save-file"),

  // Excel处理相关
  splitExcel: (options: {
    inputFile: string;
    outputDir: string;
    rowsPerFile: number;
    preserveFormat: boolean;
    copyHeaders: boolean;
  }) => ipcRenderer.invoke("split-excel", options),
  mergeExcel: (options: {
    inputDir: string;
    outputFile: string;
    preserveFormat: boolean;
    removeDuplicateHeaders: boolean;
  }) => ipcRenderer.invoke("merge-excel", options),

  // 进度监听
  onProcessingProgress: (
    callback: (data: {
      progress: number;
      message: string;
      type: "info" | "error" | "success";
    }) => void,
  ) => {
    // 先移除现有监听器，避免重复注册
    ipcRenderer.removeAllListeners("processing-progress");
    ipcRenderer.on("processing-progress", (event, data) => callback(data));
  },

  removeProcessingProgressListener: () => {
    ipcRenderer.removeAllListeners("processing-progress");
  },

  // 配置管理
  getAppConfig: () => ipcRenderer.invoke("get-app-config"),
  saveAppConfig: (config: {
    defaultOutputDir: string;
    defaultSplitOutputDir: string;
    defaultMergeOutputDir: string;
    defaultRowsPerFile: number;
    defaultPreserveFormat: boolean;
    recentFiles: Array<{
      path: string;
      lastUsed: string;
    }>;
  }) => ipcRenderer.invoke("save-app-config", config),

  // 默认输出目录管理
  ensureDefaultOutputDirs: () =>
    ipcRenderer.invoke("ensure-default-output-dirs"),
} as ElectronAPI);
