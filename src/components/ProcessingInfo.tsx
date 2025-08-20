import React, { useMemo } from "react";
import { Card, Progress, Typography } from "antd";
import { LogEntry, ProcessingResult } from "../types";

const { Text } = Typography;

// 日志显示配置
const LOG_CONFIG = {
  MAX_DISPLAY_LOGS: 1000, // 最大显示日志条数
  MAX_HEIGHT: 300, // 日志容器最大高度
} as const;

interface ProcessingInfoProps {
  processing: boolean;
  progress: number;
  logs: LogEntry[];
  result: ProcessingResult | null;
}

const ProcessingInfo: React.FC<ProcessingInfoProps> = ({
  processing,
  progress,
  logs,
  result,
}) => {
  // 只在有处理任务、日志或结果时才显示组件
  const shouldShow = processing || logs.length > 0 || result !== null;

  // 优化日志显示：限制条目数量，保留最新的日志
  const displayLogs = useMemo(() => {
    if (logs.length <= LOG_CONFIG.MAX_DISPLAY_LOGS) {
      return logs;
    }
    // 保留最新的日志条目
    return logs.slice(-LOG_CONFIG.MAX_DISPLAY_LOGS);
  }, [logs]);

  if (!shouldShow) {
    return null;
  }

  return (
    <Card
      title="处理进度"
      style={{ marginTop: 24, borderRadius: 12 }}
      size="small"
    >
      <Progress
        percent={progress}
        status={
          processing ? "active" : result?.success ? "success" : "exception"
        }
        strokeColor={{
          "0%": "#108ee9",
          "100%": "#87d068",
        }}
        style={{ marginBottom: 16 }}
      />

      {logs.length > 0 && (
        <div>
          <Text strong style={{ marginBottom: 8, display: "block" }}>
            处理日志：
          </Text>
          <div
            style={{
              overflow: "auto",
              maxHeight: LOG_CONFIG.MAX_HEIGHT,
              background: "#f6f8fa",
              border: "1px solid #e1e8ed",
              borderRadius: 8,
              padding: "12px",
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: "13px",
              lineHeight: 1.4,
            }}
          >
            {displayLogs.map((log) => (
              <div
                key={log.id || `${log.timestamp}-${log.message}`}
                style={{
                  marginBottom: "6px",
                  wordBreak: "break-word",
                  color:
                    log.type === "error"
                      ? "#ff4d4f"
                      : log.type === "success"
                        ? "#52c41a"
                        : "#262626",
                }}
              >
                <span style={{ color: "#8c8c8c", fontWeight: 600 }}>
                  [{log.timestamp}]
                </span>
                <span style={{ marginLeft: "8px" }}>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProcessingInfo;
