import pandas as pd
import os
import argparse
import glob
import sys
import warnings
from utils import ExcelFileProcessor

# 设置输出编码为UTF-8
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# 忽略xlrd和pandas的警告信息
warnings.filterwarnings('ignore', category=UserWarning, module='openpyxl')
warnings.filterwarnings('ignore', category=FutureWarning, module='xlrd')

def merge_excel_files(input_dir, output_file, remove_duplicate_headers=False):
    try:
        # 验证输入目录
        if not os.path.exists(input_dir):
            raise FileNotFoundError(f"输入目录不存在: {input_dir}")
        
        if not os.path.isdir(input_dir):
            raise ValueError(f"输入路径不是目录: {input_dir}")
        
        # 验证输出文件路径
        output_dir = os.path.dirname(output_file)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)
            print(f"创建输出目录: {output_dir}")
        
        print(f"开始扫描目录: {input_dir}")
        # 获取所有Excel文件
        excel_files = glob.glob(os.path.join(input_dir, "*.xlsx")) + glob.glob(os.path.join(input_dir, "*.xls"))
        
        if not excel_files:
            raise ValueError(f"在目录 {input_dir} 中未找到Excel文件(.xlsx/.xls)")
        
        print(f"找到{len(excel_files)}个Excel文件")
        
    except FileNotFoundError as e:
        print(f"错误: {e}")
        sys.exit(1)
    except ValueError as e:
        print(f"参数错误: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"初始化失败: {e}")
        sys.exit(1)
    
    # 读取所有Excel文件并合并
    all_data = []
    total_files = len(excel_files)
    print(f"准备合并{total_files}个Excel文件")
    
    for i, file_path in enumerate(excel_files, 1):
        try:
            print(f"正在读取文件 ({i}/{total_files}): {file_path}")
            try:
                print(f"  文件大小: {os.path.getsize(file_path)} 字节")
            except Exception:
                pass

            # 统一使用嗅探式读取，自动兼容“扩展名.xls但实际为.xlsx(Zip)”的文件
            df = ExcelFileProcessor.read_excel_with_optimization(file_path)

            if df.empty:
                print(f"警告：文件 {file_path} 为空，跳过")
                continue
                
            # 内存优化：如果DataFrame很大，可以进行数据类型优化
            if len(df) > 10000:  # 对于大于1万行的文件进行优化
                print(f"检测到大文件({len(df)}行)，正在优化内存使用...")
                # 尝试优化数据类型以减少内存使用
                for col in df.select_dtypes(include=['object']).columns:
                    try:
                        df[col] = pd.to_numeric(df[col], downcast='integer', errors='ignore')
                    except:
                        pass
            
            all_data.append(df)
            print(f"成功读取文件: {file_path}，行数: {len(df)}")
            
            # 显示进度
            progress = (i / total_files) * 100
            print(f"读取进度：{progress:.1f}% ({i}/{total_files})")
            
        except pd.errors.EmptyDataError:
            print(f"警告：文件 {file_path} 为空或无有效数据，跳过")
            continue
        except Exception as e:
            print(f"错误：读取文件 {file_path} 失败: {e}")
            continue
    
    if not all_data:
        print("错误：没有成功读取任何文件")
        return
    
    try:
        print("开始合并数据...")
        
        # 根据表头去重设置处理数据
        if remove_duplicate_headers:
            # 开启表头去重：只保留第一个文件的表头，其他文件跳过表头
            processed_data = []
            for i, df in enumerate(all_data):
                if i == 0:
                    # 第一个文件：保留完整数据包括表头
                    processed_data.append(df)
                else:
                    # 其他文件：跳过表头行，只保留数据行
                    if len(df) > 0:
                        # 确保列名一致
                        df.columns = all_data[0].columns
                        processed_data.append(df)
            merged_df = pd.concat(processed_data, ignore_index=True)
        else:
            # 关闭表头去重：保留所有文件的原始内容，包括各自的表头行
            processed_data = []
            for i, df in enumerate(all_data):
                if i == 0:
                    # 第一个文件：正常添加
                    processed_data.append(df)
                else:
                    # 其他文件：将表头作为数据行添加
                    # 创建表头行DataFrame
                    header_row = pd.DataFrame([list(df.columns)], columns=all_data[0].columns)
                    # 确保数据列名一致
                    df.columns = all_data[0].columns
                    # 先添加表头行，再添加数据
                    processed_data.append(header_row)
                    processed_data.append(df)
            merged_df = pd.concat(processed_data, ignore_index=True)
        
        # 确保输出文件为.xlsx格式（即使输入包含.xls文件）
        if not output_file.lower().endswith('.xlsx'):
            if output_file.lower().endswith('.xls'):
                output_file = output_file[:-4] + '.xlsx'
                print(f"输出文件格式已自动转换为.xlsx格式")
            elif not output_file.lower().endswith(('.xlsx', '.xls')):
                output_file += '.xlsx'
                print(f"输出文件已自动添加.xlsx扩展名")
        
        print(f"开始保存到文件: {output_file}")
        # 保存合并后的文件（统一使用openpyxl引擎确保.xlsx格式）
        try:
            with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
                merged_df.to_excel(writer, index=False)
        except Exception as e:
            print(f"警告：使用openpyxl引擎保存失败，尝试默认方法: {e}")
            merged_df.to_excel(output_file, index=False)
        
        print(f"合并完成！共处理{len(excel_files)}个文件，合并{len(merged_df)}行数据，输出文件：{output_file}")
        
    except Exception as e:
        print(f"错误: 合并或保存文件失败: {e}")
        sys.exit(1)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='合并Excel文件')
    parser.add_argument('--input_dir', required=True, help='输入Excel文件所在目录')
    parser.add_argument('--output_file', required=True, help='输出文件路径')
    parser.add_argument('--remove_duplicate_headers', action='store_true', help='是否移除重复的表头')
    
    args = parser.parse_args()
    
    merge_excel_files(args.input_dir, args.output_file, args.remove_duplicate_headers)