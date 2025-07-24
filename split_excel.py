import pandas as pd
import os
import argparse

def split_excel_file(input_file, output_dir, rows_per_file):
    # 读取Excel文件
    df = pd.read_excel(input_file)
    
    # 获取总行数
    total_rows = len(df)
    
    # 计算分割文件数量
    num_files = (total_rows // rows_per_file) + (1 if total_rows % rows_per_file > 0 else 0)
    
    # 创建输出目录（如果不存在）
    os.makedirs(output_dir, exist_ok=True)
    
    # 分割并保存文件
    for i in range(num_files):
        start_row = i * rows_per_file
        end_row = min((i + 1) * rows_per_file, total_rows)
        
        # 取出对应行数的数据
        df_subset = df.iloc[start_row:end_row]
        
        # 保存为新的Excel文件
        output_file = os.path.join(output_dir, f'split_{i+1}.xlsx')
        df_subset.to_excel(output_file, index=False)
        
        print(f'已创建文件：{output_file}（行数：{end_row - start_row}）')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='拆分Excel文件')
    parser.add_argument('--input', required=True, help='输入Excel文件路径')
    parser.add_argument('--output', required=True, help='输出目录路径')
    parser.add_argument('--rows', type=int, default=1000, help='每个文件的行数（默认：1000）')
    
    args = parser.parse_args()
    
    split_excel_file(args.input, args.output, args.rows)