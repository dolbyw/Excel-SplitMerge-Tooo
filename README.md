# Excel文件处理工具集

本项目包含四个用于处理Excel文件的Python脚本，支持基础拆分/合并操作以及保留格式的高级操作。

## 📁 文件说明

| 文件 | 功能 | 特点 |
|------|------|------|
| `split_excel.py` | 基础版Excel拆分工具 | 快速拆分，不保留格式 |
| `merge_excel.py` | 基础版Excel合并工具 | 快速合并，不保留格式 |
| `split_excel_format.py` | 高级版Excel拆分工具 | 完全保留原始格式 |
| `merge_excel_format.py` | 高级版Excel合并工具 | 完全保留原始格式 |

## ⚙️ 功能特性

- **基础版本**：使用pandas实现，适合快速处理纯数据型Excel文件
- **格式保留版本**：使用openpyxl实现，完整保留单元格样式、列宽等格式信息
- 支持大文件分块处理
- 命令行参数配置

## 📦 依赖安装

```bash
pip install pandas openpyxl
```

## 🚀 使用方法

### 拆分Excel文件
```bash
# 基础版
python split_excel.py --input "输入文件.xlsx" --output "输出目录" --rows 每文件行数

# 格式保留版
python split_excel_format.py --input "输入文件.xlsx" --output "输出目录" --rows 每文件行数
```

### 合并Excel文件
```bash
# 基础版
python merge_excel.py --input_dir "输入目录" --output_file "输出文件.xlsx"

# 格式保留版
python merge_excel_format.py --input_dir "输入目录" --output_file "输出文件.xlsx"
```

## 📝 参数说明

| 参数 | 说明 | 默认值 |
|------|------|-------|
| `--input` | 输入文件路径 | 无 |
| `--output` | 输出目录路径 | 无 |
| `--rows` | 每个文件的行数 | 1000 |
| `--input_dir` | 输入文件所在目录 | 无 |
| `--output_file` | 输出文件路径 | 无 |

## ⚠️ 注意事项

1. 确保输入路径存在且为有效Excel文件
2. 输出路径会自动创建缺失的目录
3. 格式保留版本处理速度较慢，适合需要保留复杂格式的场景
4. 处理超大文件时建议使用基础版本
5. 所有操作不会修改原始文件