#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查文档中的所有段落
"""
from docx import Document
import sys

def check_all_paragraphs(doc_path):
    """检查文档中的所有段落"""
    doc = Document(doc_path)
    print(f"\n检查文档: {doc_path}\n")
    print("=" * 80)

    for idx, paragraph in enumerate(doc.paragraphs):
        if paragraph.text.strip():
            print(f"段落 {idx+1}: {paragraph.text[:80]}")

    print("\n" + "=" * 80)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("用法: python3 check_all.py <docx文件路径>")
        sys.exit(1)

    check_all_paragraphs(sys.argv[1])
