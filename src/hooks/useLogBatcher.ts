import { useState, useCallback, useRef, useEffect } from 'react';
import { LogEntry } from '../types';

/**
 * 微批处理日志更新Hook
 * 将频繁的日志更新合并为批量更新，提升性能
 */
export const useLogBatcher = (batchDelay: number = 100) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const pendingLogsRef = useRef<LogEntry[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 批量更新日志
  const flushLogs = useCallback(() => {
    if (pendingLogsRef.current.length > 0) {
      setLogs(prev => [...prev, ...pendingLogsRef.current]);
      pendingLogsRef.current = [];
    }
    timeoutRef.current = null;
  }, []);

  // 添加日志到批处理队列
  const addLogs = useCallback((newLogs: LogEntry[]) => {
    pendingLogsRef.current.push(...newLogs);
    
    // 如果已有定时器，清除它
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // 设置新的定时器
    timeoutRef.current = setTimeout(flushLogs, batchDelay);
  }, [flushLogs, batchDelay]);

  // 清空日志
  const clearLogs = useCallback(() => {
    setLogs([]);
    pendingLogsRef.current = [];
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    logs,
    addLogs,
    clearLogs,
    flushLogs, // 手动刷新，用于任务完成时立即显示所有日志
  };
};