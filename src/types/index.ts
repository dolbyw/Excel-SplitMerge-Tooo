// 应用配置接口
export interface AppConfig {
  defaultSplitOutputDir: string;
  defaultMergeOutputDir: string;
  defaultRowsPerFile: number;
  defaultPreserveFormat: boolean;
  recentFiles: string[];
}

// 处理结果接口
export interface ProcessingResult {
  success: boolean;
  message?: string;
  error?: string;
  outputFiles?: string[];
  outputFile?: string;
  timestamp?: string;
}

// 日志条目接口
export interface LogEntry {
  id: string;
  level: "info" | "warning" | "error";
  message: string;
  details?: string;
  category?: string;
  timestamp: string;
  type?: "info" | "error" | "success";
}

// 拆分表单数据接口
export interface SplitFormData {
  inputFile: string;
  outputDir: string;
  rowsPerFile: number;
  preserveFormat: boolean;
  copyHeaders: boolean;
}

// 合并表单数据接口
export interface MergeFormData {
  inputDir: string;
  outputDir: string;
  preserveFormat: boolean;
  removeDuplicateHeaders: boolean;
}

// 文件选择结果接口
export interface FileSelectResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  message?: string;
}

// 目录选择结果接口
export interface DirectorySelectResult {
  success: boolean;
  directoryPath?: string;
  directoryName?: string;
  dirPath?: string;
  dirName?: string;
  message?: string;
}

// 进度更新数据接口
export interface ProgressData {
  percent: number;
  current: number;
  total: number;
  status: "processing" | "success" | "error";
  message?: string;
  progress: number;
  type: "info" | "error" | "success";
}

// Electron API接口
export interface ElectronAPI {
  // 文件选择相关
  selectExcelFile: () => Promise<FileSelectResult>;
  selectDirectory: () => Promise<DirectorySelectResult>;
  selectSaveFile: () => Promise<FileSelectResult>;

  // Excel处理相关
  splitExcel: (options: SplitFormData) => Promise<ProcessingResult>;
  mergeExcel: (options: MergeFormData) => Promise<ProcessingResult>;

  // 配置相关
  getAppConfig: () => Promise<AppConfig>;
  saveAppConfig: (config: AppConfig) => Promise<void>;
  ensureDefaultOutputDirs: () => Promise<void>;

  // 进度监听相关
  onProcessingProgress: (callback: (data: ProgressData) => void) => void;
  removeProcessingProgressListener: () => void;

  // 日志相关
  writeLog?: (logLine: string) => Promise<void>;
}

// 扩展Window接口
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
