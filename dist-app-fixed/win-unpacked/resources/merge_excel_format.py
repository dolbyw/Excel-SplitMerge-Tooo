import pandas as pd
import os
import argparse
import glob
import sys
import warnings
from openpyxl import load_workbook, Workbook
from openpyxl.utils import get_column_letter

# 设置输出编码为UTF-8
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# 忽略xlrd和openpyxl的警告信息
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
    
    # 创建新工作簿作为模板
    merged_wb = Workbook()
    merged_ws = merged_wb.active
    
    # 复制第一个文件的格式作为模板
    template_wb = load_workbook(excel_files[0])
    template_ws = template_wb.active
    
    # 复制列宽
    for col in template_ws.columns:
        col_letter = get_column_letter(col[0].column)
        merged_ws.column_dimensions[col_letter].width = template_ws.column_dimensions[col_letter].width
    
    # 复制表头
    for cell in template_ws[1]:
        merged_ws[cell.coordinate].value = cell.value
        merged_ws[cell.coordinate].font = cell.font.copy()
        merged_ws[cell.coordinate].border = cell.border.copy()
        merged_ws[cell.coordinate].fill = cell.fill.copy()
        merged_ws[cell.coordinate].number_format = cell.number_format
        merged_ws[cell.coordinate].protection = cell.protection.copy()
        merged_ws[cell.coordinate].alignment = cell.alignment.copy()
    
    # 当前行号
    current_row = 2  # 从第二行开始
    
    # 合并所有数据
    total_files = len(excel_files)
    print(f"准备合并{total_files}个Excel文件（保留格式）")
    
    for i, file in enumerate(excel_files):
        try:
            print(f"正在读取文件 ({i+1}/{total_files}): {file}")
            
            # 根据文件格式选择处理方式
            if file.lower().endswith('.xls'):
                print(f"  检测到.xls格式文件，先转换为.xlsx格式以保留格式")
                try:
                    # 对于.xls文件，先用pandas读取然后转换
                    df_temp = pd.read_excel(file, engine='xlrd')
                    # 创建临时.xlsx文件
                    temp_xlsx = file.replace('.xls', '_temp_merge.xlsx')
                    df_temp.to_excel(temp_xlsx, index=False, engine='openpyxl')
                    # 使用临时文件进行格式保留处理
                    wb = load_workbook(temp_xlsx)
                    ws = wb.active
                    # 标记需要清理的临时文件
                    temp_files_to_clean = getattr(merge_excel_files, 'temp_files', [])
                    temp_files_to_clean.append(temp_xlsx)
                    merge_excel_files.temp_files = temp_files_to_clean
                except Exception as e:
                    print(f"  转换.xls文件时出错: {e}，跳过此文件")
                    continue
            else:
                # 加载.xlsx工作簿
                try:
                    wb = load_workbook(file)
                    ws = wb.active
                except Exception as e:
                    print(f"  加载文件失败: {e}，跳过此文件")
                    continue
            
            # 检查文件是否为空
            if ws.max_row < 1:
                print(f"警告：文件 {file} 为空，跳过")
                continue
        
            # 确定起始行：
            if remove_duplicate_headers:
                # 开启表头去重：第一个文件跳过表头（已复制到模板），其他文件也跳过表头
                start_row = 2
            else:
                # 关闭表头去重：第一个文件跳过表头（已复制到模板），其他文件保留表头作为数据
                start_row = 2 if i == 0 else 1
            
            # 复制数据行
            rows_copied = 0
            for row in ws.iter_rows(min_row=start_row):  # 根据去重设置决定起始行
                for cell in row:
                    merged_cell = merged_ws.cell(row=current_row, column=cell.column, value=cell.value)
                    merged_cell.font = cell.font.copy()
                    merged_cell.border = cell.border.copy()
                    merged_cell.fill = cell.fill.copy()
                    merged_cell.number_format = cell.number_format
                    merged_cell.protection = cell.protection.copy()
                    merged_cell.alignment = cell.alignment.copy()
                current_row += 1
                rows_copied += 1
            
            print(f"成功读取文件: {file}，行数: {rows_copied}")
            
            # 显示进度
            progress = ((i + 1) / total_files) * 100
            print(f"读取进度：{progress:.1f}% ({i+1}/{total_files})")
            
        except Exception as e:
            print(f"错误：读取文件 {file} 失败: {e}")
            continue
    
    try:
        # 确保输出文件为.xlsx格式（即使输入包含.xls文件）
        if not output_file.lower().endswith('.xlsx'):
            if output_file.lower().endswith('.xls'):
                output_file = output_file[:-4] + '.xlsx'
                print(f"输出文件格式已自动转换为.xlsx格式")
            elif not output_file.lower().endswith(('.xlsx', '.xls')):
                output_file += '.xlsx'
                print(f"输出文件已自动添加.xlsx扩展名")
        
        print(f"开始保存到文件: {output_file}")
        # 保存合并后的文件（openpyxl自动保存为.xlsx格式）
        merged_wb.save(output_file)
        total_rows = current_row - 1  # 减去表头行
        print(f"合并完成！共处理{len(excel_files)}个文件，合并{total_rows}行数据，输出文件：{output_file}")
        
        # 清理临时文件
        temp_files = getattr(merge_excel_files, 'temp_files', [])
        for temp_file in temp_files:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
                    print(f"已清理临时文件: {temp_file}")
            except Exception as e:
                print(f"清理临时文件失败 {temp_file}: {e}")
        
    except Exception as e:
        print(f"错误: 合并或保存文件失败: {e}")
        # 即使出错也要清理临时文件
        temp_files = getattr(merge_excel_files, 'temp_files', [])
        for temp_file in temp_files:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
            except:
                pass
        sys.exit(1)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='合并Excel文件（保留格式）')
    parser.add_argument('--input_dir', required=True, help='输入Excel文件所在目录')
    parser.add_argument('--output_file', required=True, help='输出文件路径')
    parser.add_argument('--remove_duplicate_headers', action='store_true', help='是否移除重复的表头')
    
    args = parser.parse_args()
    
    merge_excel_files(args.input_dir, args.output_file, args.remove_duplicate_headers)