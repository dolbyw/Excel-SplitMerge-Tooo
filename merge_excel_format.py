import pandas as pd
import os
import argparse
import glob
from openpyxl import load_workbook, Workbook
from openpyxl.utils import get_column_letter


def merge_excel_files(input_dir, output_file):
    # 获取所有Excel文件
    excel_files = glob.glob(os.path.join(input_dir, "*.xlsx"))
    
    if not excel_files:
        print(f"错误：在{input_dir}中未找到Excel文件")
        return
    
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
    for file in excel_files:
        print(f"正在读取文件：{file}")
        wb = load_workbook(file)
        ws = wb.active
        
        # 复制数据行
        for row in ws.iter_rows(min_row=2):  # 从第二行开始复制
            for cell in row:
                merged_cell = merged_ws.cell(row=current_row, column=cell.column, value=cell.value)
                merged_cell.font = cell.font.copy()
                merged_cell.border = cell.border.copy()
                merged_cell.fill = cell.fill.copy()
                merged_cell.number_format = cell.number_format
                merged_cell.protection = cell.protection.copy()
                merged_cell.alignment = cell.alignment.copy()
            current_row += 1
    
    # 保存合并后的文件
    merged_wb.save(output_file)
    print(f"合并完成，共处理{len(excel_files)}个文件，输出文件：{output_file}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='合并Excel文件（保留格式）')
    parser.add_argument('--input_dir', required=True, help='输入Excel文件所在目录')
    parser.add_argument('--output_file', required=True, help='输出文件路径')
    
    args = parser.parse_args()
    
    merge_excel_files(args.input_dir, args.output_file)