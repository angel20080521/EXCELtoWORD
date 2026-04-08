'use client';

import { useState } from 'react';
import { Upload, FileText, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ExcelToWordGenerator() {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [wordTemplate, setWordTemplate] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; filename: string; data: Record<string, string> } | null>(null);
  const [error, setError] = useState<string>('');

  const handleGenerate = async () => {
    if (!excelFile || !wordTemplate) {
      setError('请上传 Excel 文件和 Word 模板文件');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('excelFile', excelFile);
      formData.append('wordTemplate', wordTemplate);

      const response = await fetch('/api/generate-word', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = '处理失败';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            // 如果不是JSON，尝试获取文本内容
            const textContent = await response.text();
            errorMessage = textContent || `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (parseError) {
          // 如果解析失败，使用默认错误信息
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // API 直接返回文件流，处理下载
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const filename = response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || '生成的文档.docx';

      // 触发下载
      const a = document.createElement('a');
      a.href = url;
      a.download = decodeURIComponent(filename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // 设置成功状态（但不显示下载按钮，因为已经自动下载）
      setResult({
        success: true,
        filename: decodeURIComponent(filename),
        data: {} // API不再返回data，可以暂时设为空
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '处理文件时出错');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    // 文件已经自动下载，这里可以显示提示信息
    alert('文件已自动下载，请检查浏览器的下载文件夹');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Excel 数据自动填充到 Word 模板
          </h1>
          <p className="text-gray-600">
            上传 Excel 数据文件和 Word 模板，自动生成格式化的报价文档
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 左侧：上传区域 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  文件上传
                </CardTitle>
                <CardDescription>
                  请上传 Excel 数据文件和 Word 模板文件
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="excelFile">Excel 数据文件</Label>
                  <div className="mt-2">
                    <Input
                      id="excelFile"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                  {excelFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      {excelFile.name}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="wordTemplate">Word 模板文件</Label>
                  <div className="mt-2">
                    <Input
                      id="wordTemplate"
                      type="file"
                      accept=".docx"
                      onChange={(e) => setWordTemplate(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                  {wordTemplate && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      {wordTemplate.name}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !excelFile || !wordTemplate}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? '正在处理...' : '生成 Word 文档'}
                </Button>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* 生成结果 */}
            {result && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CheckCircle2 className="h-5 w-5" />
                    生成成功
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <strong>文件名：</strong> {result.filename}
                    </p>
                    <p className="text-sm text-gray-500">
                      文件已自动下载到浏览器的下载文件夹
                    </p>
                    <Button
                      onClick={handleDownload}
                      className="w-full mt-4"
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      再次下载文档
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧：数据预览 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  提取的数据
                </CardTitle>
                <CardDescription>
                  从 Excel 文件中提取的关键数据
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="text-center py-8 text-green-600">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2" />
                    <p>文档生成成功！</p>
                    <p className="text-sm text-gray-500 mt-2">请检查浏览器的下载文件夹</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>上传文件并生成文档后，此处将显示处理结果</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  使用说明
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>1. 上传包含数据的 Excel 文件</p>
                <p>2. 上传包含占位符的 Word 模板文件</p>
                <p>3. 点击&quot;生成 Word 文档&quot;按钮</p>
                <p>4. 下载生成的文档</p>
                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="font-medium text-yellow-800 mb-1">支持的 Excel 单元格：</p>
                    <p className="text-xs">A1, A3, L3, C5, J3, J6, R3 以及第10行开始的多行数据</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
