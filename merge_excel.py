import pandas as pd
import os
import argparse
import glob

def merge_excel_files(input_dir, output_file):
    # 获取所有Excel文件
    excel_files = glob.glob(os.path.join(input_dir, "*.xlsx"))
    
    if not excel_files:
        print(f"错误：在{input_dir}中未找到Excel文件")
        return
    
    # 读取所有Excel文件
    dfs = []
    for file in excel_files:
        print(f"正在读取文件：{file}")
        df = pd.read_excel(file)
        dfs.append(df)
    
    # 合并所有数据
    merged_df = pd.concat(dfs, ignore_index=True)
    
    # 保存合并后的文件
    merged_df.to_excel(output_file, index=False)
    print(f"合并完成，共处理{len(excel_files)}个文件，输出文件：{output_file}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='合并Excel文件')
    parser.add_argument('--input_dir', required=True, help='输入Excel文件所在目录')
    parser.add_argument('--output_file', required=True, help='输出文件路径')
    
    args = parser.parse_args()
    
    merge_excel_files(args.input_dir, args.output_file)