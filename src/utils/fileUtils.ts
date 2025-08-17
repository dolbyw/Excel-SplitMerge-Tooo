/**
 * 文件处理工具函数
 * 提供文件选择、路径处理等通用功能
 */

import { FileSelectResult, DirectorySelectResult } from "../types";

/**
 * 文件选择工具类
 */
export class FileSelector {
  /**
   * 选择Excel文件
   */
  static async selectExcelFile(): Promise<FileSelectResult> {
    try {
      const result = await window.electronAPI.selectExcelFile();

      if (!result.success || !result.filePath) {
        return { success: false, message: result.message || "未选择文件" };
      }

      return {
        success: true,
        filePath: result.filePath,
        fileName: result.fileName || this.getFileName(result.filePath),
      };
    } catch (error) {
      return {
        success: false,
        message: `选择文件失败: ${error instanceof Error ? error.message : "未知错误"}`,
      };
    }
  }

  /**
   * 选择目录
   */
  static async selectDirectory(): Promise<DirectorySelectResult> {
    try {
      const result = await window.electronAPI.selectDirectory();

      if (!result.success || !result.dirPath) {
        return { success: false, message: result.message || "未选择目录" };
      }

      return {
        success: true,
        directoryPath: result.dirPath,
        directoryName:
          result.dirName || this.getDirectoryName(result.dirPath),
      };
    } catch (error) {
      return {
        success: false,
        message: `选择目录失败: ${error instanceof Error ? error.message : "未知错误"}`,
      };
    }
  }

  /**
   * 从文件路径获取文件名
   */
  static getFileName(filePath: string): string {
    return filePath.split(/[\\/]/).pop() || "";
  }

  /**
   * 从目录路径获取目录名
   */
  static getDirectoryName(directoryPath: string): string {
    return directoryPath.split(/[\\/]/).pop() || "";
  }

  /**
   * 验证文件路径是否为Excel文件
   */
  static isExcelFile(filePath: string): boolean {
    const extension = filePath.toLowerCase().split(".").pop();
    return extension === "xlsx" || extension === "xls";
  }

  /**
   * 获取文件扩展名
   */
  static getFileExtension(filePath: string): string {
    return filePath.toLowerCase().split(".").pop() || "";
  }
}



/**
 * 文件大小工具类
 */
export class FileSizeUtils {
  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * 检查文件大小是否超过限制
   */
  static isFileSizeExceeded(bytes: number, limitMB: number): boolean {
    const limitBytes = limitMB * 1024 * 1024;
    return bytes > limitBytes;
  }
}

/**
 * 文件验证工具类
 */
export class FileValidator {
  /**
   * 验证Excel文件路径
   */
  static validateExcelFile(filePath: string): {
    valid: boolean;
    message?: string;
  } {
    if (!filePath) {
      return { valid: false, message: "请选择Excel文件" };
    }

    if (!FileSelector.isExcelFile(filePath)) {
      return {
        valid: false,
        message: "请选择有效的Excel文件（.xlsx或.xls格式）",
      };
    }

    return { valid: true };
  }

  /**
   * 验证目录路径
   */
  static validateDirectory(directoryPath: string): {
    valid: boolean;
    message?: string;
  } {
    if (!directoryPath) {
      return { valid: false, message: "请选择输出目录" };
    }

    return { valid: true };
  }

  /**
   * 验证行数参数
   */
  static validateRowsPerFile(rows: number): {
    valid: boolean;
    message?: string;
  } {
    if (!rows || rows <= 0) {
      return { valid: false, message: "每个文件的行数必须大于0" };
    }

    if (rows > 1000000) {
      return { valid: false, message: "每个文件的行数不能超过1,000,000" };
    }

    return { valid: true };
  }
}
