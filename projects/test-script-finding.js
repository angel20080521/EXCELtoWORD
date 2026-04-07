#!/usr/bin/env node
/**
 * 测试Python脚本查找逻辑
 * 模拟不同环境下的行为
 */

const path = require('path');
const fs = require('fs');

console.log('=== Python脚本查找逻辑测试 ===\n');

// 测试场景
const scenarios = [
  {
    name: '当前开发环境',
    projectRoot: '/workspace/projects',
    description: '未构建，scripts目录存在'
  },
  {
    name: '模拟生产环境（未构建）',
    projectRoot: '/opt/bytefaas',
    description: 'scripts目录不存在，dist目录不存在'
  },
  {
    name: '模拟生产环境（已构建）',
    projectRoot: '/tmp/test-build',
    description: 'scripts目录不存在，dist/scripts目录存在'
  }
];

scenarios.forEach(scenario => {
  console.log(`--- 场景: ${scenario.name} ---`);
  console.log(`描述: ${scenario.description}`);
  console.log(`项目根目录: ${scenario.projectRoot}`);

  const scriptPaths = [
    path.join(scenario.projectRoot, 'scripts', 'process_excel_word.py'),
    path.join(scenario.projectRoot, 'dist', 'scripts', 'process_excel_word.py')
  ];

  console.log('\n查找脚本:');
  let scriptPath = null;
  scriptPaths.forEach((testPath, idx) => {
    const exists = fs.existsSync(testPath);
    console.log(`  ${idx + 1}. ${path.relative(scenario.projectRoot, testPath)}`);
    console.log(`     完整路径: ${testPath}`);
    console.log(`     存在: ${exists ? '✓' : '✗'}`);
    if (exists && !scriptPath) {
      scriptPath = testPath;
      console.log(`     → 使用此路径`);
    }
  });

  console.log(`\n结果: ${scriptPath ? `✓ 找到: ${path.relative(scenario.projectRoot, scriptPath)}` : '✗ 未找到'}`);
  console.log('');
});

console.log('=== 实际环境检测 ===\n');

// 检查当前环境
const actualProjectRoot = process.env.COZE_WORKSPACE_PATH || '/workspace/projects';
console.log(`当前项目根目录: ${actualProjectRoot}`);
console.log(`环境变量 COZE_WORKSPACE_PATH: ${process.env.COZE_WORKSPACE_PATH || '未设置'}`);
console.log(`当前工作目录: ${process.cwd()}`);

const actualScriptPaths = [
  path.join(actualProjectRoot, 'scripts', 'process_excel_word.py'),
  path.join(actualProjectRoot, 'dist', 'scripts', 'process_excel_word.py')
];

console.log('\n实际脚本查找:');
let actualScriptPath = null;
actualScriptPaths.forEach((testPath, idx) => {
  const exists = fs.existsSync(testPath);
  console.log(`  ${idx + 1}. ${testPath}`);
  console.log(`     存在: ${exists ? '✓' : '✗'}`);
  if (exists && !actualScriptPath) {
    actualScriptPath = testPath;
    console.log(`     → 使用此路径`);
  }
});

console.log(`\n最终选择: ${actualScriptPath || '未找到'}`);

if (actualScriptPath) {
  const stats = fs.statSync(actualScriptPath);
  console.log(`文件大小: ${stats.size} bytes`);
  console.log(`最后修改: ${stats.mtime}`);
}

console.log('\n=== 测试完成 ===');
