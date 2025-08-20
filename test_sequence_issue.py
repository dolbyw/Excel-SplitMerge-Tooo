# -*- coding: utf-8 -*-
"""
测试序号列问题的脚本
用于分析为什么合并后的Excel文件仍然包含序号列
"""

import pandas as pd
import os
from utils import ExcelFileProcessor

def test_sequence_column_detection():
    """测试序号列检测功能"""
    test_file = "Carton(119).xls"
    
    if not os.path.exists(test_file):
        print(f"测试文件 {test_file} 不存在")
        return
    
    print("=" * 60)
    print("测试序号列检测功能")
    print("=" * 60)
    
    # 使用当前的读取方法
    print("\n1. 使用当前的ExcelFileProcessor.read_excel_with_optimization方法：")
    df = ExcelFileProcessor.read_excel_with_optimization(test_file)
    
    print(f"DataFrame形状: {df.shape}")
    print(f"列名: {list(df.columns)}")
    print(f"列名类型: {[type(col) for col in df.columns]}")
    print(f"第一列数据类型: {df.iloc[:, 0].dtype}")
    print(f"前5行数据:")
    print(df.head())
    
    # 检查第一列是否为序号列
    print("\n2. 分析第一列是否为序号列：")
    first_col = df.iloc[:, 0]
    print(f"第一列前10个值: {first_col.head(10).tolist()}")
    print(f"第一列数据类型: {first_col.dtype}")
    
    # 检查是否为连续序号
    if first_col.dtype in ['int64', 'float64']:
        is_sequence_0 = (first_col == range(len(first_col))).all()
        is_sequence_1 = (first_col == range(1, len(first_col) + 1)).all()
        print(f"是否为0开始的连续序号: {is_sequence_0}")
        print(f"是否为1开始的连续序号: {is_sequence_1}")
    elif first_col.dtype == 'object':
        try:
            numeric_col = pd.to_numeric(first_col, errors='coerce')
            if not numeric_col.isna().any():
                is_sequence_0 = (numeric_col == range(len(numeric_col))).all()
                is_sequence_1 = (numeric_col == range(1, len(numeric_col) + 1)).all()
                print(f"转换为数字后，是否为0开始的连续序号: {is_sequence_0}")
                print(f"转换为数字后，是否为1开始的连续序号: {is_sequence_1}")
            else:
                print("第一列包含无法转换为数字的值")
        except Exception as e:
            print(f"转换第一列为数字时出错: {e}")
    
    # 测试直接使用pandas.read_html
    print("\n3. 直接使用pandas.read_html测试：")
    try:
        tables = pd.read_html(test_file, encoding='utf-8', header=None)
        if tables:
            df_direct = tables[0]
            print(f"直接读取的DataFrame形状: {df_direct.shape}")
            print(f"直接读取的列名: {list(df_direct.columns)}")
            print(f"直接读取的前5行:")
            print(df_direct.head())
            
            # 检查列名是否为数字序号
            print(f"\n列名是否为数字序号: {all(isinstance(col, int) for col in df_direct.columns)}")
            print(f"列名范围: {min(df_direct.columns)} 到 {max(df_direct.columns)}")
    except Exception as e:
        print(f"直接使用pandas.read_html失败: {e}")
    
    print("\n=" * 60)
    print("测试完成")
    print("=" * 60)

if __name__ == '__main__':
    test_sequence_column_detection()