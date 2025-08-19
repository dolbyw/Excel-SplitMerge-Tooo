/// <reference types="vite/client" />

// 定义ElectronAPI接口类型
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

// 声明全局Window接口
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
