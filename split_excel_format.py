import pandas as pd
import os
import argparse
from openpyxl import load_workbook, Workbook
from openpyxl.utils import get_column_letter


def split_excel_file(input_file, output_dir, rows_per_file):
    # 使用openpyxl加载原始工作簿
    wb = load_workbook(input_file)
    ws = wb.active
    
    # 获取总行数
    total_rows = ws.max_row
    
    # 计算分割文件数量
    num_files = (total_rows // rows_per_file) + (1 if total_rows % rows_per_file > 0 else 0)
    
    # 创建输出目录（如果不存在）
    os.makedirs(output_dir, exist_ok=True)
    
    # 复制原始工作簿的格式
    template_wb = Workbook()
    template_ws = template_wb.active
    
    # 复制列宽
    for col in ws.columns:
        col_letter = get_column_letter(col[0].column)
        template_ws.column_dimensions[col_letter].width = ws.column_dimensions[col_letter].width
    
    # 分割并保存文件
    for i in range(num_files):
        start_row = i * rows_per_file + 1  # openpyxl从1开始计数
        end_row = min((i + 1) * rows_per_file, total_rows) + 1
        
        # 创建新工作簿
        new_wb = Workbook()
        new_ws = new_wb.active
        
        # 复制表头
        if i == 0:
            for cell in ws[1]:
                new_ws[cell.coordinate].value = cell.value
                new_ws[cell.coordinate].font = cell.font.copy()
                new_ws[cell.coordinate].border = cell.border.copy()
                new_ws[cell.coordinate].fill = cell.fill.copy()
                new_ws[cell.coordinate].number_format = cell.number_format
                new_ws[cell.coordinate].protection = cell.protection.copy()
                new_ws[cell.coordinate].alignment = cell.alignment.copy()
        
        # 复制数据行
        for row in ws.iter_rows(min_row=start_row+1, max_row=end_row):
            for cell in row:
                new_cell = new_ws[cell.coordinate]
                new_cell.value = cell.value
                new_cell.font = cell.font.copy()
                new_cell.border = cell.border.copy()
                new_cell.fill = cell.fill.copy()
                new_cell.number_format = cell.number_format
                new_cell.protection = cell.protection.copy()
                new_cell.alignment = cell.alignment.copy()
        
        # 保存为新的Excel文件
        output_file = os.path.join(output_dir, f'split_{i+1}.xlsx')
        new_wb.save(output_file)
        
        print(f'已创建文件：{output_file}（行数：{end_row - start_row}）')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='拆分Excel文件（保留格式）')
    parser.add_argument('--input', required=True, help='输入Excel文件路径')
    parser.add_argument('--output', required=True, help='输出目录路径')
    parser.add_argument('--rows', type=int, default=1000, help='每个文件的行数（默认：1000）')
    
    args = parser.parse_args()
    
    split_excel_file(args.input, args.output, args.rows)