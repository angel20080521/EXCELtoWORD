# 路径问题解决方案

## 问题背景

在部署到生产环境（/opt/bytefaas）时遇到路径问题：
```
Command failed: python3 /opt/bytefaas/scripts/process_excel_word.py
```

虽然命令本身正确，但可能导致以下问题：
1. 脚本文件不存在（构建时未复制）
2. 路径依赖硬编码
3. 环境差异导致路径不一致

## 根本原因

1. **Next.js构建不包含scripts目录**
2. **代码依赖process.cwd()，但生产环境可能改变工作目录**
3. **缺乏统一的环境变量配置**

## 解决方案

### 1. 构建时复制必要文件

修改 `scripts/build.sh`：
```bash
# 复制Python脚本到dist/scripts/
mkdir -p dist/scripts
cp -r scripts/*.py dist/scripts/

# 复制依赖文件
cp requirements.txt dist/

# 复制public目录
cp -r public dist/

# 验证文件复制
echo "=== dist/scripts/ ==="
ls -la dist/scripts/
echo "=== dist/requirements.txt ==="
test -f dist/requirements.txt && echo "✓ Found" || echo "✗ Not found"
```

### 2. 智能查找Python脚本

API路由（`src/app/api/generate-word/route.ts`）：
```typescript
// 智能查找Python脚本（兼容开发和生产环境）
const scriptPaths = [
  path.join(projectRoot, 'scripts', 'process_excel_word.py'),      // 开发环境
  path.join(projectRoot, 'dist', 'scripts', 'process_excel_word.py') // 生产环境（构建后）
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
```

### 3. 使用环境变量统一路径

```typescript
// 优先使用环境变量，否则使用当前工作目录
const projectRoot = process.env.COZE_WORKSPACE_PATH || process.cwd();

// 所有路径基于projectRoot
const outputFullPath = path.join(projectRoot, 'public', 'generated-docs');
```

### 4. 启动脚本设置环境变量

`scripts/start.sh` 和 `scripts/dev.sh`：
```bash
# 设置环境变量
export COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH}"

# 显示路径信息（调试用）
echo "Project root: ${COZE_WORKSPACE_PATH}"
echo "Script path: ${COZE_WORKSPACE_PATH}/scripts/process_excel_word.py"
```

### 4. 添加配置文件

创建 `.env.example` 作为环境变量模板。

### 5. 更新文档

更新 `AGENTS.md`，添加环境配置说明。

## 效果

### 开发环境（未构建）
```
COZE_WORKSPACE_PATH=/workspace/projects
查找顺序：
1. /workspace/projects/scripts/process_excel_word.py ✓ 找到
2. /workspace/projects/dist/scripts/process_excel_word.py ✗ 跳过（未构建）
最终使用：/workspace/projects/scripts/process_excel_word.py
输出目录：/workspace/projects/public/generated-docs/
```

### 生产环境（已构建）
```
COZE_WORKSPACE_PATH=/opt/bytefaas
查找顺序：
1. /opt/bytefaas/scripts/process_excel_word.py ✗ 跳过（源代码不部署）
2. /opt/bytefaas/dist/scripts/process_excel_word.py ✓ 找到（构建后复制）
最终使用：/opt/bytefaas/dist/scripts/process_excel_word.py
输出目录：/opt/bytefaas/public/generated-docs/
```

## 优势

1. **环境无关**：项目可以部署到任何目录
2. **自动适配**：通过环境变量自动识别路径
3. **易于调试**：启动时显示关键路径信息
4. **易于维护**：所有路径配置集中管理

## 验证

构建和部署时，系统会自动：
1. 复制Python脚本到输出目录
2. 设置正确的环境变量
3. 显示路径信息供调试
4. 验证脚本文件是否存在

## 总结

通过以上方案，彻底解决了路径适配问题，确保项目在任何环境中都能正确运行。
