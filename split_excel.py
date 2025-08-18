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
        
        print(f"开始读取Excel文件: {input_file}")
        print(f"文件路径: {input_file}")
        print(f"文件大小: {os.path.getsize(input_file)} 字节")
        
        # 使用统一的嗅探式读取，自动兼容扩展名与实际容器不一致的.xls文件
        df = ExcelFileProcessor.read_excel_with_optimization(input_file)
        print(f"成功读取文件，共{len(df)}行数据")

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

    # 拆分仅针对数据行，不包含表头
    data_df = df.copy()

    # 计算分割文件数量
    total_rows = len(data_df)
    if total_rows == 0:
        os.makedirs(output_dir, exist_ok=True)
        base_name = os.path.splitext(os.path.basename(input_file))[0]
        output_file = os.path.join(output_dir, f'{base_name}Split1.xlsx')
        # 创建空的DataFrame，若需要复制表头则包含列名
        empty_df = pd.DataFrame(columns=df.columns if copy_headers else None)
        with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
            empty_df.to_excel(writer, index=False)
        print(f'已创建文件：{output_file}（行数：0）')
        return

    num_files = (total_rows + rows_per_file - 1) // rows_per_file
    print(f"准备拆分为{num_files}个文件，每个文件最多{rows_per_file}行")

    os.makedirs(output_dir, exist_ok=True)
    base_name = os.path.splitext(os.path.basename(input_file))[0]

    for i in range(num_files):
        try:
            start_idx = i * rows_per_file
            end_idx = min((i + 1) * rows_per_file, total_rows)
            
            print(f"正在处理第{i+1}/{num_files}个文件...")
            
            # 使用copy()避免视图警告，但对于大文件使用iloc切片更节省内存
            chunk = data_df.iloc[start_idx:end_idx].copy()

            # 将分块写入文件（统一输出为.xlsx格式以确保兼容性）
            output_file = os.path.join(output_dir, f'{base_name}Split{i+1}.xlsx')
            try:
                with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
                    # DataFrame.to_excel 会自动写入表头（列名）。如果不需要表头，传header=False。
                    chunk.to_excel(writer, index=False, header=True if copy_headers else False)
            except Exception as e:
                print(f"警告：保存文件 {output_file} 时出现问题，尝试备用方法: {e}")
                # 备用保存方法
                chunk.to_excel(output_file, index=False, header=True if copy_headers else False)
            
            print(f'已创建文件：{output_file}（行数：{len(chunk)}）')
            
            # 显式删除chunk以释放内存
            del chunk
            
            # 计算并显示进度
            progress = ((i + 1) / num_files) * 100
            print(f"进度：{progress:.1f}% ({i+1}/{num_files})")
            
        except Exception as e:
            print(f"错误：处理第{i+1}个文件时失败: {e}")
            raise

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='拆分Excel文件（基础版）')
    parser.add_argument('--input', required=True, help='输入Excel文件路径')
    parser.add_argument('--output', required=True, help='输出目录路径')
    parser.add_argument('--rows', type=int, default=1000, help='每个文件的行数（默认：1000）')
    parser.add_argument('--copy_headers', action='store_true', help='是否在每个拆分文件中复制表头')

    args = parser.parse_args()

    split_excel_file(args.input, args.output, args.rows, args.copy_headers)