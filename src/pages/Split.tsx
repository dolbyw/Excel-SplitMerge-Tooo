import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Switch,
  InputNumber,
  message,
  Typography,
  Radio,
  Space,
  Divider,
} from "antd";

const { Text } = Typography;
import ProcessingInfo from "../components/ProcessingInfo";
import {
  FileExcelOutlined,
  FolderOpenOutlined,
  SplitCellsOutlined,
} from "@ant-design/icons";
import { AppConfig, SplitFormData, LogEntry, ProcessingResult } from "../types";
import { FileValidator, FileSelector } from "../utils/fileUtils";
import { ValidationUtils } from "../utils/errorUtils";

const Split: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  useEffect(() => {
    // 加载应用配置并创建默认目录
    const loadConfig = async () => {
      try {
        // 确保默认输出目录存在
        await window.electronAPI.ensureDefaultOutputDirs();

        const appConfig = await window.electronAPI.getAppConfig();
        setConfig(appConfig);
        form.setFieldsValue({
          outputDir: appConfig.defaultSplitOutputDir, // 使用拆分专用的默认路径
          rowsPerFile: appConfig.defaultRowsPerFile,
          preserveFormat: appConfig.defaultPreserveFormat,
          copyHeaders: true,
        });
      } catch (error) {
        console.error("加载配置失败:", error);
      }
    };

    loadConfig();
  }, [form]);

  const handleSelectFile = async () => {
    try {
      const result = await FileSelector.selectExcelFile();

      if (result.success && result.filePath) {
        // 验证文件
        const validation = FileValidator.validateExcelFile(result.filePath);
        if (!validation.valid) {
          message.error(validation.message);
          return;
        }

        form.setFieldValue("inputFile", result.filePath);
        message.success(`已选择文件: ${result.fileName}`);
      } else if (result.message) {
        message.warning(result.message);
      }
    } catch (error) {
      console.error("选择文件失败:", error);
      message.error("选择文件失败");
    }
  };

  const handleSelectOutputDir = async () => {
    try {
      const result = await window.electronAPI.selectDirectory();
      if (result.success && result.directoryPath) {
        form.setFieldValue("outputDir", result.directoryPath);
      }
    } catch {
      message.error("选择目录失败");
    }
  };

  const handleSetDefaultOutputDir = async () => {
    try {
      const currentDir = form.getFieldValue("outputDir");
      if (currentDir) {
        // 更新配置中的默认拆分输出目录
        const currentConfig = await window.electronAPI.getAppConfig();
        const newConfig = {
          ...currentConfig,
          defaultSplitOutputDir: currentDir,
        };
        await window.electronAPI.saveAppConfig(newConfig);
        message.success("已设为默认输出目录");
      }
    } catch {
      message.error("设置默认目录失败");
    }
  };

  // 添加清理函数，在组件卸载时清理监听器
  useEffect(() => {
    return () => {
      // 组件卸载时清理监听器
      window.electronAPI?.removeProcessingProgressListener?.();
    };
  }, []);

  const handleSubmit = async (values: SplitFormData) => {
    try {
      // 验证输入文件
      ValidationUtils.validateRequired(values.inputFile, "输入文件");
      const fileValidation = FileValidator.validateExcelFile(values.inputFile);
      if (!fileValidation.valid) {
        message.error(fileValidation.message);
        return;
      }

      // 验证输出目录
      ValidationUtils.validateRequired(values.outputDir, "输出目录");
      const dirValidation = FileValidator.validateDirectory(values.outputDir);
      if (!dirValidation.valid) {
        message.error(dirValidation.message);
        return;
      }

      // 验证行数参数
      ValidationUtils.validateRequired(values.rowsPerFile, "每个文件的行数");
      ValidationUtils.validateNumberRange(
        values.rowsPerFile,
        1,
        1000000,
        "每个文件的行数",
      );
      const rowsValidation = FileValidator.validateRowsPerFile(
        values.rowsPerFile,
      );
      if (!rowsValidation.valid) {
        message.error(rowsValidation.message);
        return;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "输入验证失败";
      message.error(errorMessage);
      return;
    }

    setLoading(true);
    setProcessing(true);
    setProgress(0);
    setLogs([]);
    setResult(null);

    // 监听进度更新
    window.electronAPI.onProcessingProgress((data) => {
      setProgress(data.progress);
      const lines = (data.message || "")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      setLogs((prev) => [
        ...prev,
        ...lines.map((line, index) => ({
          id: `${Date.now()}-${index}`,
          level: data.type as "info" | "error",
          message: line,
          timestamp: new Date().toLocaleTimeString(),
          type: data.type as "info" | "error" | "success",
        })),
      ]);
    });

    try {
      const result = await window.electronAPI.splitExcel(values);
      setResult(result);

      if (result.success) {
        message.success("拆分完成！");
      } else {
        message.error(result.message || "拆分失败");
      }
    } catch (error) {
      console.error("拆分过程中发生错误:", error);
      message.error("拆分过程中发生错误");
      setResult({ success: false, message: "拆分失败" });
    } finally {
      setLoading(false);
      setProcessing(false);
      window.electronAPI.removeProcessingProgressListener();
    }
  };

  const handleReset = () => {
    form.resetFields();
    if (config) {
      form.setFieldsValue({
        outputDir: config.defaultSplitOutputDir, // 使用拆分专用的默认路径
        rowsPerFile: config.defaultRowsPerFile,
        preserveFormat: config.defaultPreserveFormat,
        copyHeaders: true,
      });
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Card style={{ borderRadius: 12 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            rowsPerFile: 1000,
            preserveFormat: false,
            copyHeaders: true,
          }}
        >
          <Form.Item
            label="选择Excel文件"
            name="inputFile"
            rules={[{ required: true, message: "请选择要拆分的Excel文件" }]}
          >
            <Input
              placeholder="点击右侧按钮选择Excel文件（支持.xlsx/.xls格式）"
              readOnly
              suffix={
                <Button
                  type="text"
                  icon={<FileExcelOutlined />}
                  onClick={handleSelectFile}
                >
                  浏览
                </Button>
              }
            />
          </Form.Item>

          <Form.Item
            label="输出目录"
            name="outputDir"
            rules={[{ required: true, message: "请选择输出目录" }]}
          >
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="点击右侧按钮选择输出目录"
                readOnly
                style={{ width: "calc(100% - 140px)" }}
                value={form.getFieldValue("outputDir")}
              />
              <Button
                type="default"
                icon={<FolderOpenOutlined />}
                onClick={handleSelectOutputDir}
                style={{ width: "70px" }}
              >
                浏览
              </Button>
              <Button
                type="default"
                onClick={handleSetDefaultOutputDir}
                style={{ width: "70px" }}
                disabled={!form.getFieldValue("outputDir")}
              >
                设为默认
              </Button>
            </Space.Compact>
          </Form.Item>

          {/* 水平布局：每个文件的行数和自动复制表头 */}
          <div
            style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}
          >
            <Form.Item
              label="每个文件的行数"
              name="rowsPerFile"
              rules={[
                { required: true, message: "请输入每个文件的行数" },
                {
                  type: "number",
                  min: 1,
                  max: 100000,
                  message: "行数必须在1-100000之间",
                },
              ]}
              style={{ flex: 1, marginBottom: 0 }}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="请输入每个文件包含的行数"
                min={1}
                max={100000}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => {
                  if (!value) return 1;
                  const num = Number(value.replace(/\$\s?|(,*)/g, ""));
                  return Math.max(1, Math.min(100000, num)) as 1 | 100000;
                }}
              />
            </Form.Item>

            <Form.Item
              label="自动复制表头"
              name="copyHeaders"
              valuePropName="checked"
              style={{ flex: 1, marginBottom: 0 }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Switch
                  checkedChildren="开启"
                  unCheckedChildren="关闭"
                  onChange={(checked) =>
                    form.setFieldValue("copyHeaders", checked)
                  }
                />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  为每个拆分文件自动添加原始表头
                </Text>
              </div>
            </Form.Item>
          </div>

          <Form.Item
            label="处理模式"
            name="preserveFormat"
            rules={[{ required: true, message: "请选择处理模式" }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value={false}>
                  <Space>
                    <Text strong>基础版本（推荐）</Text>
                    <Text type="secondary">- 快速处理，适合纯数据文件</Text>
                  </Space>
                </Radio>
                <Radio value={true}>
                  <Space>
                    <Text strong>格式保留版本</Text>
                    <Text type="secondary">- 完整保留格式，处理速度较慢</Text>
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Divider />

          <Form.Item>
            <div style={{ display: "flex", gap: 12 }}>
              <Button
                type="primary"
                icon={<SplitCellsOutlined />}
                loading={loading}
                htmlType="submit"
              >
                开始拆分
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </div>
          </Form.Item>

          <ProcessingInfo
            processing={processing}
            progress={progress}
            logs={logs}
            result={result}
          />
        </Form>
      </Card>
    </div>
  );
};

export default Split;
