#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查 Word 文档的字体格式
"""
from docx import Document
import sys

def check_document_format(doc_path):
    """检查文档的字体格式"""
    doc = Document(doc_path)
    print(f"\n检查文档: {doc_path}\n")
    print("=" * 80)

    for i, paragraph in enumerate(doc.paragraphs):
        if paragraph.text.strip():
            # 检查A3 (报价单位名称)
            if '报价单位名称' in paragraph.text or '上海理想信息产业（集团）有限公司' in paragraph.text:
                print(f"\n找到 A3 (报价单位名称) - 段落 {i+1}")
                print(f"文本内容: {paragraph.text[:50]}...")
                print(f"段落对齐: {paragraph.alignment}")
                for j, run in enumerate(paragraph.runs):
                    if run.text.strip():
                        print(f"  Run {j+1}: '{run.text[:30]}...'")
                        print(f"    字体名称: {run.font.name}")
                        print(f"    东亚字体: {run._element.rPr.rFonts.get(qn('w:eastAsia')) if run._element.rPr else 'N/A'}")
                        print(f"    字号: {run.font.size}")
                        print(f"    加粗: {run.font.bold}")
                        # 检查 XML 级别的加粗设置
                        if run._element.rPr:
                            b_element = run._element.rPr.find(qn('w:b'))
                            print(f"    XML 加粗元素: {'存在' if b_element is not None else '不存在'}")
                            if b_element is not None:
                                print(f"    XML 加粗值: {b_element.get(qn('w:val'))}")

            # 检查L3 (日期)
            elif '2026年03月30日' in paragraph.text or (paragraph.text.strip() and len(paragraph.text.strip()) <= 20 and '年' in paragraph.text and '月' in paragraph.text and '日' in paragraph.text):
                print(f"\n找到 L3 (日期) - 段落 {i+1}")
                print(f"文本内容: {paragraph.text}")
                for j, run in enumerate(paragraph.runs):
                    if run.text.strip():
                        print(f"  Run {j+1}: '{run.text}'")
                        print(f"    字体名称: {run.font.name}")
                        print(f"    东亚字体: {run._element.rPr.rFonts.get(qn('w:eastAsia')) if run._element.rPr else 'N/A'}")
                        print(f"    字号: {run.font.size}")
                        print(f"    加粗: {run.font.bold}")
                        # 检查 XML 级别的加粗设置
                        if run._element.rPr:
                            b_element = run._element.rPr.find(qn('w:b'))
                            print(f"    XML 加粗元素: {'存在' if b_element is not None else '不存在'}")
                            if b_element is not None:
                                print(f"    XML 加粗值: {b_element.get(qn('w:val'))}")

    print("\n" + "=" * 80)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("用法: python3 check_format.py <docx文件路径>")
        sys.exit(1)

    from docx.oxml.ns import qn
    check_document_format(sys.argv[1])
