import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Radio,
  Space,
  Typography,
  message,
  Divider,
  Switch,
} from "antd";

const { Text } = Typography;
import ProcessingInfo from "../components/ProcessingInfo";
import { FolderOpenOutlined, MergeCellsOutlined } from "@ant-design/icons";
import { AppConfig, MergeFormData, LogEntry, ProcessingResult } from "../types";
import { FileValidator } from "../utils/fileUtils";
import { ValidationUtils } from "../utils/errorUtils";
import { useLogBatcher } from "../hooks/useLogBatcher";

const Merge: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { logs, addLogs, clearLogs, flushLogs } = useLogBatcher(100);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const outputDir = Form.useWatch("outputDir", form);

  useEffect(() => {
    // 加载应用配置并创建默认目录
    const loadConfig = async () => {
      try {
        // 检查是否在Electron环境中
        if (window.electronAPI) {
          // 确保默认输出目录存在
          await window.electronAPI.ensureDefaultOutputDirs();

          const appConfig = await window.electronAPI.getAppConfig();
          setConfig(appConfig);
          form.setFieldsValue({
            outputDir: appConfig.defaultMergeOutputDir, // 使用合并专用的默认路径
            preserveFormat: appConfig.defaultPreserveFormat,
            removeDuplicateHeaders: true, // 默认开启表头去重
          });
        } else {
          // 开发环境下的默认配置
          console.warn("开发环境：未检测到Electron API，使用默认配置");
          form.setFieldsValue({
            outputDir: "./output",
            preserveFormat: false,
            removeDuplicateHeaders: true,
          });
        }
      } catch (error) {
        console.error("加载配置失败:", error);
        // 设置默认值以确保表单正常工作
        form.setFieldsValue({
          outputDir: "./output",
          preserveFormat: false,
          removeDuplicateHeaders: true,
        });
      }
    };

    loadConfig();
  }, [form]);

  const handleSelectInputDir = async () => {
    try {
      const result = await window.electronAPI.selectDirectory();
      console.log("目录选择结果:", result);

      if (result.success && result.dirPath) {
        // 验证目录
        const validation = FileValidator.validateDirectory(result.dirPath);
        if (!validation.valid) {
          message.error(validation.message);
          return;
        }

        form.setFieldValue("inputDir", result.dirPath);
        message.success(`已选择目录: ${result.dirName}`);
      } else if (result.message) {
        message.warning(result.message);
      }
    } catch (error) {
      console.error("选择目录异常:", error);
      message.error("选择目录失败，请重试");
    }
  };

  const handleSelectOutputDir = async () => {
    try {
      const result = await window.electronAPI.selectDirectory();
      if (result.success && result.dirPath) {
        // 验证目录
        const validation = FileValidator.validateDirectory(result.dirPath);
        if (!validation.valid) {
          message.error(validation.message);
          return;
        }

        form.setFieldValue("outputDir", result.dirPath);
        message.success(`已选择输出目录: ${result.dirName}`);
      } else if (result.message) {
        message.warning(result.message);
      }
    } catch (error) {
      console.error("选择输出目录失败:", error);
      message.error("选择目录失败");
    }
  };

  const handleSetDefaultOutputDir = async () => {
    try {
      const currentDir = form.getFieldValue("outputDir");
      if (currentDir) {
        // 更新配置中的默认合并输出目录
        const currentConfig = await window.electronAPI.getAppConfig();
        const newConfig = {
          ...currentConfig,
          defaultMergeOutputDir: currentDir,
        };
        await window.electronAPI.saveAppConfig(newConfig);
        message.success("已设为默认输出目录");
      }
    } catch {
      message.error("设置默认目录失败");
    }
  };

  // 添加清理函数
  useEffect(() => {
    return () => {
      window.electronAPI?.removeProcessingProgressListener?.();
    };
  }, []);

  const handleSubmit = async (values: MergeFormData) => {
    try {
      // 验证输入目录
      ValidationUtils.validateRequired(values.inputDir, "输入目录");
      const dirValidation = FileValidator.validateDirectory(values.inputDir);
      if (!dirValidation.valid) {
        message.error(dirValidation.message);
        return;
      }

      // 验证输出目录
      ValidationUtils.validateRequired(values.outputDir, "输出目录");
      const outputDirValidation = FileValidator.validateDirectory(
        values.outputDir,
      );
      if (!outputDirValidation.valid) {
        message.error(outputDirValidation.message);
        return;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "输入验证失败";
      message.error(errorMessage);
      return;
    }

    const inputDirName = values.inputDir.split(/[\\/]/).pop() || "merged";
    const outputFileName = `${inputDirName}Merge.xlsx`;
    const outputFilePath = `${values.outputDir}/${outputFileName}`;

    setLoading(true);
    setProcessing(true);
    setProgress(0);
    clearLogs();
    setResult(null);

    window.electronAPI.onProcessingProgress((data) => {
      setProgress(data.progress);
      const lines = (data.message || "")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      
      // 使用微批处理添加日志
      const newLogs = lines.map((line, index) => ({
        id: `${Date.now()}-${index}`,
        level: data.type as "info" | "error",
        message: line,
        timestamp: new Date().toLocaleTimeString(),
        type: data.type as "info" | "error" | "success",
      }));
      addLogs(newLogs);
    });

    try {
      const mergeOptions = {
        ...values,
        outputFile: outputFilePath,
      };
      const result = await window.electronAPI.mergeExcel(mergeOptions);
      setResult(result);

      if (result.success) {
        message.success("合并完成！");
      } else {
        message.error(result.message || "合并失败");
      }
    } catch (error) {
      console.error("合并过程中发生错误:", error);
      message.error("合并过程中发生错误");
      setResult({ success: false, message: "合并失败" });
    } finally {
      setLoading(false);
      setProcessing(false);
      flushLogs(); // 确保所有日志都显示
      window.electronAPI.removeProcessingProgressListener();
    }
  };

  const handleReset = () => {
    form.resetFields();
    if (config) {
      form.setFieldsValue({
        outputDir: config.defaultMergeOutputDir, // 使用合并专用的默认路径
        preserveFormat: config.defaultPreserveFormat,
        removeDuplicateHeaders: true,
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
            preserveFormat: false,
            removeDuplicateHeaders: true,
          }}
        >
          <Form.Item
            label="选择输入目录"
            name="inputDir"
            rules={[{ required: true, message: "请选择包含Excel文件的目录" }]}
          >
            <Input
              placeholder="选择包含Excel文件的目录（支持.xlsx/.xls）"
              readOnly
              suffix={
                <Button
                  type="text"
                  icon={<FolderOpenOutlined />}
                  onClick={handleSelectInputDir}
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
                placeholder="选择输出目录（文件名自动生成：源目录名+Merge.xlsx）"
                readOnly
                style={{ width: "calc(100% - 140px)" }}
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
                disabled={!outputDir}
              >
                设为默认
              </Button>
            </Space.Compact>
          </Form.Item>

          <Form.Item
            label="表头去重"
            name="removeDuplicateHeaders"
            valuePropName="checked"
            style={{ marginBottom: 16 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Switch
                checkedChildren="开启"
                unCheckedChildren="关闭"
              />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                若关闭，将保留各文件的表头行
              </Text>
            </div>
          </Form.Item>

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
                icon={<MergeCellsOutlined />}
                loading={loading}
                htmlType="submit"
              >
                开始合并
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

export default Merge;
