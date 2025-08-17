import React from "react";
import { Card, Progress, Typography } from "antd";
import { LogEntry, ProcessingResult } from "../types";

const { Text } = Typography;

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
              background: "#f6f8fa",
              border: "1px solid #e1e8ed",
              borderRadius: 8,
              padding: "12px",
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: "13px",
              lineHeight: 1.4,
            }}
          >
            {logs.map((log, index) => (
              <div
                key={index}
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
