import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import { ProcessManager } from './processUtils';

/**
 * Python解释器候选列表（按优先级排序）
 */
const PYTHON_INTERPRETERS = ['py', 'python3', 'python'] as const;

/**
 * Python进程启动配置
 */
interface PythonLaunchConfig {
  scriptPath: string;
  args: string[];
  taskType: 'split' | 'merge';
  onProgress?: (data: { progress: number; message: string; type: string }) => void;
  onError?: (error: string) => void;
}

/**
 * Python进程启动结果
 */
interface PythonLaunchResult {
  success: boolean;
  message: string;
  outputFiles?: string[];
  outputFile?: string;
}

/**
 * 统一的Python进程启动器
 * 提供解释器兜底、统一环境配置、准确的超时文案
 */
export class PythonLauncher {
  /**
   * 尝试启动Python进程，自动尝试多个解释器
   */
  static async launch(config: PythonLaunchConfig): Promise<PythonLaunchResult> {
    const { scriptPath, args, taskType, onProgress, onError } = config;
    
    // 尝试不同的Python解释器
    for (const interpreter of PYTHON_INTERPRETERS) {
      try {
        console.log(`尝试使用 ${interpreter} 启动Python脚本:`, scriptPath);
        
        const result = await this.spawnPythonProcess({
          interpreter,
          scriptPath,
          args,
          taskType,
          onProgress,
          onError,
        });
        
        console.log(`${interpreter} 启动成功`);
        return result;
      } catch (error) {
        console.warn(`${interpreter} 启动失败:`, error);
        
        // 如果是最后一个解释器，返回错误
        if (interpreter === PYTHON_INTERPRETERS[PYTHON_INTERPRETERS.length - 1]) {
          const errorMessage = `无法启动Python进程。请确保已安装Python并添加到系统PATH中。尝试的解释器: ${PYTHON_INTERPRETERS.join(', ')}`;
          onError?.(errorMessage);
          return {
            success: false,
            message: errorMessage,
          };
        }
      }
    }
    
    // 理论上不会到达这里
    return {
      success: false,
      message: 'Python进程启动失败',
    };
  }
  
  /**
   * 启动Python进程的核心实现
   */
  private static spawnPythonProcess(config: {
    interpreter: string;
    scriptPath: string;
    args: string[];
    taskType: 'split' | 'merge';
    onProgress?: (data: { progress: number; message: string; type: string }) => void;
    onError?: (error: string) => void;
  }): Promise<PythonLaunchResult> {
    const { interpreter, scriptPath, args, taskType, onProgress, onError } = config;
    
    return new Promise((resolve) => {
      // 统一的环境配置
      const env = {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
        PYTHONUNBUFFERED: '1', // 确保输出不被缓冲
      };
      
      const pythonProcess = spawn(interpreter, [scriptPath, ...args], {
        env,
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      
      let output = '';
      let errorOutput = '';
      const startTime = Date.now();
      
      // 统一的超时处理
      const timeoutHandler = ProcessManager.createTimeoutHandler(
        pythonProcess,
        ProcessManager.DEFAULT_TIMEOUT,
        () => {
          const taskName = taskType === 'split' ? '拆分' : '合并';
          console.log(`Python${taskName}进程超时，正在终止...`);
          
          const timeoutMessage = `${taskName}处理超时，请检查文件大小或网络连接`;
          onProgress?.({
            progress: 0,
            message: timeoutMessage,
            type: 'error',
          });
          
          resolve({
            success: false,
            message: timeoutMessage,
          });
        },
      );
      
      // 处理标准输出
      pythonProcess.stdout.on('data', (data) => {
        const message = data.toString('utf8');
        output += message;
        console.log('Python输出:', message.trim());
        
        // 发送进度更新
        onProgress?.({
          progress: 50, // 简化的进度计算，后续可扩展为解析Python输出的进度信息
          message: message.trim(),
          type: 'info',
        });
      });
      
      // 处理错误输出
      pythonProcess.stderr.on('data', (data) => {
        const error = data.toString('utf8');
        errorOutput += error;
        console.error('Python错误输出:', error.trim());
      });
      
      // 处理进程启动错误
      pythonProcess.on('error', (error) => {
        const taskName = taskType === 'split' ? '拆分' : '合并';
        console.error(`Python${taskName}进程启动失败:`, error);
        timeoutHandler.clearTimeout();
        
        const errorMessage = `${taskName}进程启动失败: ${error.message}`;
        onProgress?.({
          progress: 0,
          message: errorMessage,
          type: 'error',
        });
        
        // 抛出错误以便上层尝试下一个解释器
        throw new Error(errorMessage);
      });
      
      // 处理进程退出
      pythonProcess.on('close', async (code) => {
        timeoutHandler.clearTimeout();
        
        const taskName = taskType === 'split' ? '拆分' : '合并';
        console.log(`Python进程退出，退出码: ${code}`);
        console.log('完整输出:', output);
        if (errorOutput) console.error('完整错误输出:', errorOutput);
        
        if (code === 0) {
          onProgress?.({
            progress: 100,
            message: `${taskName}完成！`,
            type: 'success',
          });
          
          resolve({
            success: true,
            message: `${taskName}完成`,
          });
        } else {
          const errorMessage = `${taskName}失败: ${errorOutput || '未知错误'}`;
          onProgress?.({
            progress: 0,
            message: errorMessage,
            type: 'error',
          });
          
          resolve({
            success: false,
            message: errorOutput || `${taskName}失败`,
          });
        }
      });
    });
  }
}