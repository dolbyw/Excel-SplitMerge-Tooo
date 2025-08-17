# -*- coding: utf-8 -*-
"""
公共工具函数模块
提供文件处理、错误处理、进度报告等通用功能
"""

import os
import sys
import pandas as pd
from typing import List, Optional, Tuple

# 设置输出编码为UTF-8
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')


class FileValidator:
    """文件验证工具类"""
    
    @staticmethod
    def validate_input_file(file_path: str) -> None:
        """验证输入文件是否存在且格式正确"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"输入文件不存在: {file_path}")
        
        if not file_path.lower().endswith(('.xlsx', '.xls')):
            raise ValueError(f"不支持的文件格式: {file_path}，仅支持.xlsx和.xls格式")
    
    @staticmethod
    def validate_output_directory(dir_path: str) -> None:
        """验证并创建输出目录"""
        if not dir_path:
            raise ValueError("输出目录路径不能为空")
        
        try:
            os.makedirs(dir_path, exist_ok=True)
        except Exception as e:
            raise ValueError(f"无法创建输出目录 {dir_path}: {e}")
    
    @staticmethod
    def validate_rows_per_file(rows_per_file: int) -> None:
        """验证每个文件的行数参数"""
        if rows_per_file <= 0:
            raise ValueError(f"每个文件的行数必须大于0，当前值: {rows_per_file}")


class ExcelFileProcessor:
    """Excel文件处理工具类"""
    
    @staticmethod
    def get_excel_files(directory: str) -> List[str]:
        """获取目录中所有Excel文件"""
        if not os.path.exists(directory):
            raise FileNotFoundError(f"目录不存在: {directory}")
        
        excel_files = []
        for file in os.listdir(directory):
            if file.lower().endswith(('.xlsx', '.xls')):
                excel_files.append(os.path.join(directory, file))
        
        if not excel_files:
            raise ValueError(f"目录 {directory} 中没有找到Excel文件")
        
        return sorted(excel_files)
    
    @staticmethod
    def read_excel_with_optimization(file_path: str) -> pd.DataFrame:
        """读取Excel文件并进行内存优化"""
        try:
            df = pd.read_excel(file_path)
            
            # 对大文件进行内存优化
            if len(df) > 10000:
                print(f"检测到大文件({len(df)}行)，正在优化内存使用...")
                # 尝试优化数据类型以减少内存使用
                for col in df.select_dtypes(include=['object']).columns:
                    try:
                        df[col] = pd.to_numeric(df[col], downcast='integer', errors='ignore')
                    except:
                        pass
            
            return df
        except pd.errors.EmptyDataError:
            raise ValueError(f"文件 {file_path} 为空或无有效数据")
        except Exception as e:
            raise ValueError(f"读取文件 {file_path} 失败: {e}")
    
    @staticmethod
    def get_base_filename(file_path: str) -> str:
        """获取文件的基础名称（不含扩展名）"""
        return os.path.splitext(os.path.basename(file_path))[0]


class ProgressReporter:
    """进度报告工具类"""
    
    @staticmethod
    def report_progress(current: int, total: int, task_name: str = "处理") -> None:
        """报告处理进度"""
        progress = (current / total) * 100
        print(f"{task_name}进度：{progress:.1f}% ({current}/{total})")
    
    @staticmethod
    def report_file_processing(current: int, total: int, file_name: str = "") -> None:
        """报告文件处理进度"""
        file_info = f" - {file_name}" if file_name else ""
        print(f"正在处理第{current}/{total}个文件{file_info}...")


class ErrorHandler:
    """错误处理工具类"""
    
    @staticmethod
    def handle_file_error(file_path: str, error: Exception, continue_on_error: bool = True) -> bool:
        """处理文件操作错误
        
        Args:
            file_path: 出错的文件路径
            error: 异常对象
            continue_on_error: 是否在错误后继续处理
            
        Returns:
            bool: 是否应该继续处理
        """
        if isinstance(error, pd.errors.EmptyDataError):
            print(f"警告：文件 {file_path} 为空或无有效数据，跳过")
        elif isinstance(error, FileNotFoundError):
            print(f"错误：文件 {file_path} 不存在")
        else:
            print(f"错误：处理文件 {file_path} 失败: {error}")
        
        if not continue_on_error:
            raise error
        
        return continue_on_error
    
    @staticmethod
    def handle_validation_error(error: Exception) -> None:
        """处理验证错误"""
        if isinstance(error, FileNotFoundError):
            print(f"文件错误: {error}")
        elif isinstance(error, ValueError):
            print(f"参数错误: {error}")
        else:
            print(f"验证失败: {error}")
        sys.exit(1)


class MemoryManager:
    """内存管理工具类"""
    
    @staticmethod
    def cleanup_dataframe(df: pd.DataFrame) -> None:
        """清理DataFrame以释放内存"""
        if df is not None:
            del df
    
    @staticmethod
    def get_memory_usage_info(df: pd.DataFrame) -> str:
        """获取DataFrame内存使用信息"""
        memory_usage = df.memory_usage(deep=True).sum()
        memory_mb = memory_usage / (1024 * 1024)
        return f"内存使用: {memory_mb:.2f} MB"


def print_separator(title: str = "") -> None:
    """打印分隔线"""
    separator = "=" * 50
    if title:
        print(f"\n{separator}")
        print(f" {title} ")
        print(f"{separator}\n")
    else:
        print(f"\n{separator}\n")


def safe_file_operation(operation_func, *args, **kwargs):
    """安全执行文件操作的装饰器函数"""
    try:
        return operation_func(*args, **kwargs)
    except Exception as e:
        ErrorHandler.handle_validation_error(e)