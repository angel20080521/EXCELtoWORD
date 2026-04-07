#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查文档的所有字体格式
"""
from docx import Document
from docx.oxml.ns import qn
import sys

def check_all_formats(doc_path):
    """检查文档的所有字体格式"""
    doc = Document(doc_path)
    print(f"\n检查文档: {doc_path}\n")
    print("=" * 80)

    for i, paragraph in enumerate(doc.paragraphs):
        if paragraph.text.strip():
            # 检查A1 (项目名称)
            if '虚拟化平台杀毒软件续费项目' in paragraph.text or '{{A1}}' in paragraph.text:
                print(f"\n找到 A1 (项目名称) - 段落 {i+1}")
                print(f"文本内容: {paragraph.text[:50]}...")
                for j, run in enumerate(paragraph.runs):
                    if run.text.strip():
                        print(f"  Run {j+1}: '{run.text[:30]}...'")
                        print(f"    字体名称: {run.font.name}")
                        if run._element.rPr:
                            print(f"    东亚字体: {run._element.rPr.rFonts.get(qn('w:eastAsia'))}")
                        print(f"    字号: {run.font.size}")
                        print(f"    加粗: {run.font.bold}")
                        if run._element.rPr:
                            b_element = run._element.rPr.find(qn('w:b'))
                            print(f"    XML 加粗元素: {'存在' if b_element is not None else '不存在'}")

            # 检查C5 (客户名称)
            if '客户名称' in paragraph.text or '{{C5}}' in paragraph.text:
                print(f"\n找到 C5 (客户名称) - 段落 {i+1}")
                print(f"文本内容: {paragraph.text[:50]}...")
                for j, run in enumerate(paragraph.runs):
                    if run.text.strip():
                        print(f"  Run {j+1}: '{run.text[:30]}...'")
                        print(f"    字体名称: {run.font.name}")
                        if run._element.rPr:
                            print(f"    东亚字体: {run._element.rPr.rFonts.get(qn('w:eastAsia'))}")
                        print(f"    字号: {run.font.size}")
                        print(f"    加粗: {run.font.bold}")

            # 检查H6 (发票类型)
            if '增值税' in paragraph.text or '{{H6}}' in paragraph.text:
                print(f"\n找到 H6 (发票类型) - 段落 {i+1}")
                print(f"文本内容: {paragraph.text[:50]}...")
                for j, run in enumerate(paragraph.runs):
                    if run.text.strip():
                        print(f"  Run {j+1}: '{run.text[:30]}...'")
                        print(f"    字体名称: {run.font.name}")
                        if run._element.rPr:
                            print(f"    东亚字体: {run._element.rPr.rFonts.get(qn('w:eastAsia'))}")
                        print(f"    字号: {run.font.size}")
                        print(f"    加粗: {run.font.bold}")

            # 检查A3 (报价单位名称)
            if '报价单位名称' in paragraph.text or '{{A3}}' in paragraph.text:
                print(f"\n找到 A3 (报价单位名称) - 段落 {i+1}")
                print(f"文本内容: {paragraph.text[:50]}...")
                print(f"段落对齐: {paragraph.alignment}")
                for j, run in enumerate(paragraph.runs):
                    if run.text.strip():
                        print(f"  Run {j+1}: '{run.text[:30]}...'")
                        print(f"    字体名称: {run.font.name}")
                        if run._element.rPr:
                            print(f"    东亚字体: {run._element.rPr.rFonts.get(qn('w:eastAsia'))}")
                        print(f"    字号: {run.font.size}")
                        print(f"    加粗: {run.font.bold}")

            # 检查L3 (日期)
            elif '2026年' in paragraph.text and ('月' in paragraph.text and '日' in paragraph.text):
                print(f"\n找到 L3 (日期) - 段落 {i+1}")
                print(f"文本内容: {paragraph.text}")
                for j, run in enumerate(paragraph.runs):
                    if run.text.strip():
                        print(f"  Run {j+1}: '{run.text}'")
                        print(f"    字体名称: {run.font.name}")
                        if run._element.rPr:
                            print(f"    东亚字体: {run._element.rPr.rFonts.get(qn('w:eastAsia'))}")
                        print(f"    字号: {run.font.size}")
                        print(f"    加粗: {run.font.bold}")

    print("\n" + "=" * 80)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("用法: python3 check_all_formats.py <docx文件路径>")
        sys.exit(1)

    check_all_formats(sys.argv[1])
