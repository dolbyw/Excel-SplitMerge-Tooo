# -*- coding: utf-8 -*-
import pandas as pd
import os
import argparse
import sys
import warnings
from utils import ExcelFileProcessor

# 设置输出编码为UTF-8
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# 忽略xlrd的警告信息
warnings.filterwarnings('ignore', category=UserWarning, module='openpyxl')
warnings.filterwarnings('ignore', category=FutureWarning, module='xlrd')

def split_excel_file(input_file, output_dir, rows_per_file, copy_headers=False):
    try:
        # 验证输入文件
        if not os.path.exists(input_file):
            raise FileNotFoundError(f"输入文件不存在: {input_file}")
        
        if not input_file.lower().endswith(('.xlsx', '.xls')):
            raise ValueError(f"不支持的文件格式: {input_file}，仅支持.xlsx和.xls格式")
        
        # 验证参数
        if rows_per_file <= 0:
            raise ValueError(f"每个文件的行数必须大于0，当前值: {rows_per_file}")
        
        print(f"[拆分] 开始读取文件: {os.path.basename(input_file)}")
        
        # 使用统一的嗅探式读取，自动兼容扩展名与实际容器不一致的.xls文件
        df = ExcelFileProcessor.read_excel_with_optimization(input_file)
        print(f"[拆分] 文件读取完成: {len(df)}行数据")

    except FileNotFoundError as e:
        print(f"错误: {e}")
        sys.exit(1)
    except ValueError as e:
        print(f"参数错误: {e}")
        sys.exit(1)
    except pd.errors.EmptyDataError:
        print(f"错误: Excel文件为空或无法读取: {input_file}")
        sys.exit(1)
    except Exception as e:
        print(f"读取Excel文件失败: {e}")
        sys.exit(1)

    # 检查是否为HTML格式文件（通过文件内容判断）
    is_html_format = False
    try:
        with open(input_file, 'rb') as f:
            magic = f.read(50)
            if b'<html' in magic.lower() or b'<table' in magic.lower():
                is_html_format = True
    except:
        pass
    
    if is_html_format:
        # HTML格式：第一行是表头，其余是数据行
        header_row = df.iloc[0:1].copy() if len(df) > 0 else None
        data_df = df.iloc[1:].copy() if len(df) > 1 else pd.DataFrame(columns=df.columns)
        print(f"[拆分] HTML格式 - 数据行: {len(data_df)}行")
    else:
        # 其他格式：pandas已处理表头，所有DataFrame行都是数据行
        header_row = None  # 没有单独的表头行
        data_df = df.copy()  # 所有行都是数据行
        print(f"[拆分] 标准格式 - 数据行: {len(data_df)}行")

    # 计算分割文件数量（基于数据行，不包含表头）
    total_data_rows = len(data_df)
    if total_data_rows == 0:
        os.makedirs(output_dir, exist_ok=True)
        base_name = os.path.splitext(os.path.basename(input_file))[0]
        output_file = os.path.join(output_dir, f'{base_name}Split1.xlsx')
        # 创建空的DataFrame
        if copy_headers:
            if is_html_format and header_row is not None:
                # HTML格式且需要复制表头，只包含表头行
                empty_df = header_row.copy()
            elif not is_html_format:
                # 标准格式，创建带列名的空DataFrame
                empty_df = pd.DataFrame(columns=df.columns if len(df.columns) > 0 else None)
            else:
                # HTML格式但无表头，创建空DataFrame
                empty_df = pd.DataFrame(columns=df.columns if len(df.columns) > 0 else None)
        else:
            # 不复制表头，创建空DataFrame
            empty_df = pd.DataFrame(columns=df.columns if len(df.columns) > 0 else None)
        with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
            empty_df.to_excel(writer, index=False, header=copy_headers)
        print(f'已创建文件：{output_file}（行数：{len(empty_df)}）')
        return

    num_files = (total_data_rows + rows_per_file - 1) // rows_per_file
    header_mode = "包含表头" if copy_headers else "仅数据"
    print(f"[拆分] 开始拆分: {num_files}个文件 ({header_mode})")

    os.makedirs(output_dir, exist_ok=True)
    base_name = os.path.splitext(os.path.basename(input_file))[0]

    for i in range(num_files):
        try:
            start_idx = i * rows_per_file
            end_idx = min((i + 1) * rows_per_file, total_data_rows)
            
            print(f"[拆分] 处理文件 {i+1}/{num_files}")
            
            # 获取当前分块的数据
            chunk = data_df.iloc[start_idx:end_idx].copy()

            # 将分块写入文件（统一输出为.xlsx格式以确保兼容性）
            output_file = os.path.join(output_dir, f'{base_name}Split{i+1}.xlsx')
            try:
                with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
                    if copy_headers:
                        if is_html_format and header_row is not None:
                            # HTML格式：先写入表头行，再写入数据
                            combined_df = pd.concat([header_row, chunk], ignore_index=True)
                            combined_df.to_excel(writer, index=False, header=False)
                        else:
                            # 标准格式：使用列名作为表头
                            chunk.to_excel(writer, index=False, header=True)
                    else:
                        # 不复制表头：只输出数据行，不包含列名
                        chunk.to_excel(writer, index=False, header=False)
            except Exception as e:
                print(f"警告：保存文件 {output_file} 时出现问题，尝试备用方法: {e}")
                # 备用保存方法
                if copy_headers:
                    if is_html_format and header_row is not None:
                        # HTML格式：先写入表头行，再写入数据
                        combined_df = pd.concat([header_row, chunk], ignore_index=True)
                        combined_df.to_excel(output_file, index=False, header=False)
                    else:
                        # 标准格式：使用列名作为表头
                        chunk.to_excel(output_file, index=False, header=True)
                else:
                    chunk.to_excel(output_file, index=False, header=False)
            
            # 计算实际行数
            actual_data_rows = len(chunk)
            output_filename = os.path.basename(output_file)
            print(f"[拆分] 完成: {output_filename} ({actual_data_rows}行)")
            
            # 显式删除变量以释放内存
            del chunk
            
        except Exception as e:
            print(f"错误：处理第{i+1}个文件时失败: {e}")
            raise

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='拆分Excel文件（基础版）')
    parser.add_argument('--input', required=True, help='输入Excel文件路径')
    parser.add_argument('--output', required=True, help='输出目录路径')
    parser.add_argument('--rows', type=int, default=1000, help='每个文件的行数（默认：1000）')
    parser.add_argument('--copy_headers', type=lambda x: x.lower() == 'true', default=False, help='是否在每个拆分文件中复制表头')

    args = parser.parse_args()

    split_excel_file(args.input, args.output, args.rows, args.copy_headers)