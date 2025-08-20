# -*- coding: utf-8 -*-
"""
测试序号列修复效果的脚本
"""

import pandas as pd
import os
from utils import ExcelFileProcessor

def test_sequence_removal():
    """测试序号列移除功能"""
    print("=" * 60)
    print("测试序号列移除功能")
    print("=" * 60)
    
    # 测试1：创建包含序号列的DataFrame
    print("\n测试1：创建包含序号列的DataFrame")
    test_data = {
        0: list(range(5)),  # 序号列：0, 1, 2, 3, 4
        1: ['SN1', 'SN2', 'SN3', 'SN4', 'SN5'],
        2: ['Data1', 'Data2', 'Data3', 'Data4', 'Data5']
    }
    df_test = pd.DataFrame(test_data)
    print(f"原始DataFrame:")
    print(df_test)
    print(f"列名: {list(df_test.columns)}")
    
    # 应用序号列移除
    df_cleaned = ExcelFileProcessor._remove_sequence_columns(df_test)
    print(f"\n清理后的DataFrame:")
    print(df_cleaned)
    print(f"列名: {list(df_cleaned.columns)}")
    
    # 测试2：测试字符串序号列
    print("\n测试2：创建包含字符串序号列的DataFrame")
    test_data2 = {
        'seq': ['0', '1', '2', '3', '4'],  # 字符串序号列
        'name': ['Name1', 'Name2', 'Name3', 'Name4', 'Name5'],
        'value': ['Val1', 'Val2', 'Val3', 'Val4', 'Val5']
    }
    df_test2 = pd.DataFrame(test_data2)
    print(f"原始DataFrame:")
    print(df_test2)
    
    # 应用序号列移除
    df_cleaned2 = ExcelFileProcessor._remove_sequence_columns(df_test2)
    print(f"\n清理后的DataFrame:")
    print(df_cleaned2)
    
    # 测试3：测试正常数据（不应该被移除）
    print("\n测试3：测试正常数据（不应该被移除）")
    test_data3 = {
        'id': [100, 200, 300, 400, 500],  # 非序号的ID
        'name': ['Name1', 'Name2', 'Name3', 'Name4', 'Name5'],
        'value': ['Val1', 'Val2', 'Val3', 'Val4', 'Val5']
    }
    df_test3 = pd.DataFrame(test_data3)
    print(f"原始DataFrame:")
    print(df_test3)
    
    # 应用序号列移除
    df_cleaned3 = ExcelFileProcessor._remove_sequence_columns(df_test3)
    print(f"\n清理后的DataFrame:")
    print(df_cleaned3)
    print(f"应该保持不变: {df_test3.equals(df_cleaned3)}")
    
    print("\n=" * 60)
    print("测试完成")
    print("=" * 60)

if __name__ == '__main__':
    test_sequence_removal()