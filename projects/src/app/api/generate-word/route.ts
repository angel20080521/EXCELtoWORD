import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const excelFile = formData.get('excelFile') as File;
    const wordTemplate = formData.get('wordTemplate') as File;

    if (!excelFile || !wordTemplate) {
      return NextResponse.json(
        { error: '缺少必要参数：excelFile, wordTemplate' },
        { status: 400 }
      );
    }

    // 读取文件内容
    const excelBuffer = Buffer.from(await excelFile.arrayBuffer());
    const wordBuffer = Buffer.from(await wordTemplate.arrayBuffer());

    // 获取项目根目录（优先使用环境变量，否则使用当前工作目录）
    const projectRoot = process.env.COZE_WORKSPACE_PATH || process.cwd();

    // 创建临时目录（使用系统临时目录 /tmp）
    const tempDir = '/tmp/excel-word-temp';
    await mkdir(tempDir, { recursive: true });

    // 确定输出目录（生产环境必须使用 /tmp，因为 /opt/bytefaas/public 是只读的）
    const outputDir = '/tmp/generated-docs';
    await mkdir(outputDir, { recursive: true });

    // 保存临时文件
    const excelTempPath = path.join(tempDir, excelFile.name);
    const wordTempPath = path.join(tempDir, wordTemplate.name);

    await writeFile(excelTempPath, excelBuffer);
    await writeFile(wordTempPath, wordBuffer);

    // 智能查找Python脚本（兼容所有部署场景）
    const scriptPaths = [
      path.join(projectRoot, 'scripts', 'process_excel_word.py'),           // 开发环境
      path.join(projectRoot, 'dist', 'scripts', 'process_excel_word.py'),   // 生产环境（dist结构）
      path.join(projectRoot, 'process_excel_word.py'),                      // 生产环境（根目录）
      path.join(process.cwd(), 'scripts', 'process_excel_word.py'),          // 当前工作目录
      path.join(process.cwd(), 'process_excel_word.py'),                     // 当前工作目录（根目录）
    ];

    let scriptPath: string | null = null;
    for (const testPath of scriptPaths) {
      if (require('fs').existsSync(testPath)) {
        scriptPath = testPath;
        break;
      }
    }

    // 验证脚本文件是否存在
    if (!scriptPath) {
      return NextResponse.json(
        {
          error: `Python脚本不存在。尝试的路径：\n${scriptPaths.join('\n')}`,
          projectRoot,
          attemptedPaths: scriptPaths,
          cwd: process.cwd()
        },
        { status: 500 }
      );
    }

    // 确保Python依赖已安装
    try {
      await execAsync('pip3 install -q openpyxl==3.1.2 python-docx==1.1.0');
    } catch (installError) {
      console.warn('Warning: Failed to install Python dependencies:', installError);
    }

    console.log('=== Python Script Info ===');
    console.log('Project root:', projectRoot);
    console.log('Working directory:', process.cwd());
    console.log('Script path:', scriptPath);
    console.log('Script exists:', require('fs').existsSync(scriptPath));
    console.log('Script file stats:', scriptPath ? require('fs').statSync(scriptPath) : 'N/A');
    console.log('Command:', `python3 "${scriptPath}" "${excelTempPath}" "${wordTempPath}" "${outputDir}"`);
    console.log('========================');

    const command = `python3 "${scriptPath}" "${excelTempPath}" "${wordTempPath}" "${outputDir}"`;

    console.log('Executing command...');
    const { stdout, stderr } = await execAsync(command);
    console.log('Command completed');
    console.log('Stdout length:', stdout.length);
    console.log('Stderr length:', stderr.length);
    console.log('Stdout content:', stdout.substring(0, 500)); // 只显示前500字符
    console.log('Stderr content:', stderr.substring(0, 500)); // 只显示前500字符

    if (stderr) {
      console.error('Python script error:', stderr);
    }

    // 检查stdout是否为空或不是有效的JSON
    if (!stdout || stdout.trim() === '') {
      return NextResponse.json(
        { error: 'Python脚本没有输出任何内容' },
        { status: 500 }
      );
    }

    let result;
    try {
      result = JSON.parse(stdout);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw stdout:', stdout);
      return NextResponse.json(
        { error: `Python脚本输出格式错误: ${parseError.message}` },
        { status: 500 }
      );
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // 读取生成的Word文件
    const generatedFilePath = path.join(outputDir, result.output_file);
    const fileBuffer = await require('fs').promises.readFile(generatedFilePath);

    // 返回文件流（直接下载）
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(result.output_file)}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error processing files:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '处理文件时出错' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Excel to Word API is running',
    endpoints: {
      POST: '/api/generate-word - 上传 Excel 和 Word 模板文件，生成 Word 文档'
    }
  });
}
