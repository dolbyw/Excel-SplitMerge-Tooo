# -*- coding: utf-8 -*-
"""
公共工具函数模块
提供文件处理、错误处理、进度报告等通用功能
"""

import os
import sys
import pandas as pd
import warnings
from typing import List, Optional, Tuple

# 设置输出编码为UTF-8
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# 忽略xlrd和pandas的警告信息
warnings.filterwarnings('ignore', category=UserWarning, module='openpyxl')
warnings.filterwarnings('ignore', category=FutureWarning, module='xlrd')


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
        """读取Excel文件并进行内存优化，支持.xls、.xlsx和HTML格式"""
        try:
            # 基于文件头进行容器嗅探，解决"扩展名为.xls但实际是其他格式"的兼容问题
            magic = b""
            try:
                with open(file_path, 'rb') as f:
                    magic = f.read(16)  # 读取更多字节以便更好地检测
            except Exception:
                magic = b""

            # 根据文件扩展名与嗅探结果选择合适的引擎
            engine = None
            if file_path.lower().endswith('.xls'):
                if magic.startswith(b'PK'):
                    # 实际是.xlsx（Zip/OOXML）
                    engine = 'openpyxl'
                    print("检测到扩展名为 .xls 但实际为 .xlsx (Zip/OOXML) 容器，自动使用 openpyxl 引擎")
                elif magic.startswith(b'\xD0\xCF\x11\xE0'):
                    # 经典OLE2二进制.xls
                    engine = 'xlrd'
                    print("检测到真实二进制 .xls (OLE2)，使用 xlrd 引擎")
                elif magic.startswith(b'<html') or magic.startswith(b'<HTML') or b'<html' in magic[:50]:
                    # HTML格式的表格文件（常见于某些系统导出的.xls文件）
                    print("检测到 HTML 格式的表格文件，使用 pandas.read_html 读取")
                    try:
                        # 使用read_html读取HTML表格
                        tables = pd.read_html(file_path, encoding='utf-8')
                        if tables:
                            df = tables[0]  # 取第一个表格
                            print(f"成功从HTML中读取表格，共{len(df)}行数据")
                            return df
                        else:
                            raise ValueError("HTML文件中未找到表格")
                    except Exception as html_e:
                        print(f"HTML读取失败，尝试其他方法: {html_e}")
                        # 如果HTML读取失败，继续尝试其他引擎
                        engine = 'xlrd'
                else:
                    # 无法明确识别，优先尝试xlrd
                    engine = 'xlrd'
                    print("无法明确识别 .xls 容器类型，优先尝试 xlrd 引擎")
            elif file_path.lower().endswith('.xlsx'):
                engine = 'openpyxl'  # 使用openpyxl引擎处理.xlsx文件
                print(f"检测到.xlsx格式文件，使用openpyxl引擎")
            
            # 尝试使用选择的引擎读取
            try:
                df = pd.read_excel(file_path, engine=engine)
            except Exception as e:
                print(f"使用{engine}引擎失败，尝试自动检测引擎: {e}")
                # 针对.xls但嗅探为Zip的场景，再显式尝试 openpyxl
                if file_path.lower().endswith('.xls') and magic.startswith(b'PK'):
                    try:
                        print("再次显式使用 openpyxl 引擎尝试读取 .xls(Zip) ...")
                        df = pd.read_excel(file_path, engine='openpyxl')
                    except Exception as e2:
                        print(f"显式 openpyxl 仍失败: {e2}")
                        raise e2
                else:
                    # 最后尝试HTML读取（如果之前没有尝试过）
                    if not (magic.startswith(b'<html') or magic.startswith(b'<HTML') or b'<html' in magic[:50]):
                        df = pd.read_excel(file_path)
                    else:
                        try:
                            print("最后尝试使用 pandas.read_html 读取...")
                            tables = pd.read_html(file_path, encoding='utf-8')
                            if tables:
                                df = tables[0]
                                print(f"HTML读取成功，共{len(df)}行数据")
                            else:
                                raise ValueError("HTML文件中未找到表格")
                        except Exception as final_e:
                            print(f"所有方法都失败了: {final_e}")
                            raise final_e
            
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