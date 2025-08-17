/**
 * 进程处理工具函数
 * 提供Python进程调用、超时处理等功能
 */

import { ProgressData } from "../types";

/**
 * 进程管理工具类
 */
export class ProcessManager {
  /**
   * 默认超时时间（毫秒）
   */
  static readonly DEFAULT_TIMEOUT = 5 * 60 * 1000; // 5分钟

  /**
   * 解析Python进程输出中的进度信息
   */
  static parseProgressInfo(output: string): ProgressData | null {
    // 匹配进度百分比信息
    const progressMatch = output.match(/进度：(\d+\.?\d*)%\s*\((\d+)\/(\d+)\)/);
    if (progressMatch) {
      const [, percentStr, currentStr, totalStr] = progressMatch;
      return {
        percent: parseFloat(percentStr),
        current: parseInt(currentStr, 10),
        total: parseInt(totalStr, 10),
        status: "processing",
        progress: parseFloat(percentStr),
        type: "info",
      };
    }

    // 匹配文件处理信息
    const fileMatch = output.match(/正在处理第(\d+)\/(\d+)个文件/);
    if (fileMatch) {
      const [, currentStr, totalStr] = fileMatch;
      const current = parseInt(currentStr, 10);
      const total = parseInt(totalStr, 10);
      const progress = (current / total) * 100;
      return {
        percent: progress,
        current,
        total,
        status: "processing",
        progress,
        type: "info",
      };
    }

    // 匹配完成信息
    if (output.includes("完成") || output.includes("已创建文件")) {
      return {
        percent: 100,
        current: 1,
        total: 1,
        status: "success",
        progress: 100,
        type: "success",
      };
    }

    // 匹配错误信息
    if (output.includes("错误") || output.includes("失败")) {
      return {
        percent: 0,
        current: 0,
        total: 1,
        status: "error",
        message: output.match(/错误：(.+)/)
          ? output.match(/错误：(.+)/)![1]
          : "处理失败",
        progress: 0,
        type: "error",
      };
    }

    return null;
  }

  /**
   * 解析Python进程输出中的结果信息
   */
  static parseResultInfo(output: string): {
    success: boolean;
    message: string;
  } {
    // 检查是否成功完成
    if (
      output.includes("成功") ||
      output.includes("完成") ||
      output.includes("已创建文件")
    ) {
      return {
        success: true,
        message: "处理成功完成",
      };
    }

    // 检查是否有错误
    const errorMatch = output.match(/错误：(.+)/);
    if (errorMatch) {
      return {
        success: false,
        message: errorMatch[1],
      };
    }

    // 默认返回
    return {
      success: true,
      message: "处理完成",
    };
  }

  /**
   * 解析Python进程输出中的日志信息
   */
  static parseLogInfo(
    output: string,
  ): { level: "info" | "warning" | "error"; message: string }[] {
    const logs: { level: "info" | "warning" | "error"; message: string }[] = [];

    // 按行分割输出
    const lines = output.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // 错误日志
      if (trimmedLine.includes("错误") || trimmedLine.includes("失败")) {
        logs.push({
          level: "error",
          message: trimmedLine,
        });
        continue;
      }

      // 警告日志
      if (trimmedLine.includes("警告")) {
        logs.push({
          level: "warning",
          message: trimmedLine,
        });
        continue;
      }

      // 信息日志
      logs.push({
        level: "info",
        message: trimmedLine,
      });
    }

    return logs;
  }

  /**
   * 创建超时处理函数
   */
  static createTimeoutHandler(
    process: { kill: () => void } | null,
    timeoutMs: number = this.DEFAULT_TIMEOUT,
    onTimeout: () => void,
  ): { timeoutId: NodeJS.Timeout; clearTimeout: () => void } {
    const timeoutId = setTimeout(() => {
      try {
        if (process && typeof process.kill === "function") {
          process.kill();
        }
        onTimeout();
      } catch (error) {
        console.error("终止超时进程失败:", error);
      }
    }, timeoutMs);

    return {
      timeoutId,
      clearTimeout: () => clearTimeout(timeoutId),
    };
  }
}

/**
 * 命令行参数构建工具类
 */
export class CommandBuilder {
  private args: string[] = [];

  /**
   * 添加参数
   */
  addArg(
    name: string,
    value: string | number | boolean | undefined,
  ): CommandBuilder {
    if (value !== undefined) {
      if (typeof value === "boolean") {
        if (value) {
          this.args.push(`--${name}`);
        }
      } else {
        this.args.push(`--${name}`, String(value));
      }
    }
    return this;
  }

  /**
   * 构建命令行参数数组
   */
  build(): string[] {
    return [...this.args];
  }

  /**
   * 构建命令行字符串
   */
  buildString(): string {
    return this.args.join(" ");
  }
}
