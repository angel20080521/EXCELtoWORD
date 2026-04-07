#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查文档中的 A1 位置
"""
from docx import Document
import sys

def check_a1_positions(doc_path):
    """检查文档中的 A1 位置"""
    doc = Document(doc_path)
    print(f"\n检查文档: {doc_path}\n")
    print("=" * 80)

    a1_indices = []
    for idx, paragraph in enumerate(doc.paragraphs):
        if '亚信虚拟化杀毒软件续保' in paragraph.text or '{{A1}}' in paragraph.text:
            a1_indices.append(idx)
            print(f"找到 A1 - 段落 {idx+1}: {paragraph.text[:50]}...")

    print(f"\nA1 总数: {len(a1_indices)}")
    print(f"A1 位置索引: {a1_indices}")

    if len(a1_indices) >= 2:
        print(f"\n第二个 A1 在段落 {a1_indices[1] + 1}")
        print(f"第2页范围: 段落 {max(1, a1_indices[1] - 10 + 1)} 到 {a1_indices[1] + 10 + 1}")

    if a1_indices:
        print(f"\n最后一个 A1 在段落 {a1_indices[-1] + 1}")
        print(f"最后一页范围: 段落 {max(1, a1_indices[-1] - 10 + 1)} 到 {a1_indices[-1] + 10 + 1}")

    print("\n" + "=" * 80)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("用法: python3 check_a1.py <docx文件路径>")
        sys.exit(1)

    check_a1_positions(sys.argv[1])
