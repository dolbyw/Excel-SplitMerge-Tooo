/**
 * 错误处理工具函数
 * 提供统一的错误处理、日志记录等功能
 */

import { LogEntry, ProcessingResult } from "../types";

/**
 * 错误类型枚举
 */
export enum ErrorType {
  FILE_NOT_FOUND = "FILE_NOT_FOUND",
  INVALID_FORMAT = "INVALID_FORMAT",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  PROCESSING_ERROR = "PROCESSING_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * 错误处理工具类
 */
export class ErrorHandler {
  /**
   * 解析错误信息并返回用户友好的消息
   */
  static parseError(error: unknown): {
    type: ErrorType;
    message: string;
    details?: string;
  } {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      // 文件不存在错误
      if (message.includes("not found") || message.includes("不存在")) {
        return {
          type: ErrorType.FILE_NOT_FOUND,
          message: "文件不存在，请检查文件路径是否正确",
          details: error.message,
        };
      }

      // 格式错误
      if (
        message.includes("format") ||
        message.includes("格式") ||
        message.includes("extension")
      ) {
        return {
          type: ErrorType.INVALID_FORMAT,
          message: "文件格式不支持，请选择Excel文件（.xlsx或.xls）",
          details: error.message,
        };
      }

      // 权限错误
      if (
        message.includes("permission") ||
        message.includes("access") ||
        message.includes("权限")
      ) {
        return {
          type: ErrorType.PERMISSION_DENIED,
          message: "没有文件访问权限，请检查文件是否被其他程序占用",
          details: error.message,
        };
      }

      // 处理错误
      if (message.includes("processing") || message.includes("处理")) {
        return {
          type: ErrorType.PROCESSING_ERROR,
          message: "文件处理失败，请检查文件内容是否正确",
          details: error.message,
        };
      }

      // 验证错误
      if (
        message.includes("validation") ||
        message.includes("验证") ||
        message.includes("invalid")
      ) {
        return {
          type: ErrorType.VALIDATION_ERROR,
          message: "输入参数验证失败，请检查输入内容",
          details: error.message,
        };
      }

      return {
        type: ErrorType.UNKNOWN_ERROR,
        message: error.message || "发生未知错误",
        details: error.stack,
      };
    }

    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: "发生未知错误",
      details: String(error),
    };
  }

  /**
   * 创建错误结果对象
   */
  static createErrorResult(error: unknown): ProcessingResult {
    const parsedError = this.parseError(error);
    return {
      success: false,
      message: parsedError.message,
      error: parsedError.details,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 显示错误通知
   */
  static showErrorNotification(
    error: unknown,
    title: string = "操作失败",
  ): void {
    const parsedError = this.parseError(error);

    // 这里可以集成具体的通知组件，比如 antd 的 notification
    console.error(`${title}: ${parsedError.message}`, parsedError.details);

    // 如果有全局通知系统，可以在这里调用
    // notification.error({
    //   message: title,
    //   description: parsedError.message,
    //   duration: 5
    // });
  }
}

/**
 * 日志工具类
 */
export class Logger {
  private static logs: LogEntry[] = [];

  /**
   * 添加日志条目
   */
  static addLog(
    level: "info" | "warning" | "error",
    message: string,
    details?: string,
  ): LogEntry {
    const logEntry: LogEntry = {
      id: Date.now().toString(),
      level,
      message,
      details,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(logEntry);

    // 控制台输出
    switch (level) {
      case "info":
        console.info(`[INFO] ${message}`, details || "");
        break;
      case "warning":
        console.warn(`[WARNING] ${message}`, details || "");
        break;
      case "error":
        console.error(`[ERROR] ${message}`, details || "");
        break;
    }

    return logEntry;
  }

  /**
   * 获取所有日志
   */
  static getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * 清空日志
   */
  static clearLogs(): void {
    this.logs = [];
  }

  /**
   * 获取指定级别的日志
   */
  static getLogsByLevel(level: "info" | "warning" | "error"): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * 导出日志为文本
   */
  static exportLogsAsText(): string {
    return this.logs
      .map(
        (log) =>
          `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}${log.details ? ` - ${log.details}` : ""}`,
      )
      .join("\n");
  }

  /**
   * 记录信息日志
   */
  static info(message: string, details?: string): LogEntry {
    return this.addLog("info", message, details);
  }

  /**
   * 记录警告日志
   */
  static warning(message: string, details?: string): LogEntry {
    return this.addLog("warning", message, details);
  }

  /**
   * 记录错误日志
   */
  static error(message: string, details?: string): LogEntry {
    return this.addLog("error", message, details);
  }
}

/**
 * 重试工具类
 */
export class RetryHandler {
  /**
   * 重试执行函数
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        Logger.warning(`第${attempt}次尝试失败`, lastError.message);

        if (attempt < maxAttempts) {
          await this.sleep(delay * attempt); // 递增延迟
        }
      }
    }

    Logger.error(`重试${maxAttempts}次后仍然失败`, lastError!.message);
    throw lastError!;
  }

  /**
   * 延迟函数
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * 验证工具类
 */
export class ValidationUtils {
  /**
   * 验证必填字段
   */
  static validateRequired(value: unknown, fieldName: string): void {
    if (value === null || value === undefined || value === "") {
      throw new Error(`${fieldName}是必填项`);
    }
  }

  /**
   * 验证数字范围
   */
  static validateNumberRange(
    value: number,
    min: number,
    max: number,
    fieldName: string,
  ): void {
    if (value < min || value > max) {
      throw new Error(`${fieldName}必须在${min}到${max}之间`);
    }
  }

  /**
   * 验证文件路径
   */
  static validateFilePath(path: string, fieldName: string): void {
    this.validateRequired(path, fieldName);

    // 简单的路径格式验证
    if (
      !/^[a-zA-Z]:\\|^\//.test(path) &&
      !path.includes("/") &&
      !path.includes("\\")
    ) {
      throw new Error(`${fieldName}格式不正确`);
    }
  }
}
