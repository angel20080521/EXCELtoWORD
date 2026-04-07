# 项目上下文

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **Python**: 3.12
  - openpyxl==3.1.2 (Excel处理)
  - python-docx==1.1.0 (Word处理)

## 目录结构

```
├── public/                 # 静态资源
│   └── generated-docs/     # 生成的Word文档输出目录
├── scripts/                # 构建与启动脚本 + Python工具脚本
│   ├── build.sh            # 构建脚本
│   ├── dev.sh              # 开发环境启动脚本
│   ├── prepare.sh          # 预处理脚本
│   ├── start.sh            # 生产环境启动脚本
│   ├── process_excel_word.py # Excel转Word核心处理脚本
│   ├── check_excel_detail.py   # Excel数据检查工具
│   └── check_*.py          # 其他检查工具
├── src/
│   ├── app/                # 页面路由与布局
│   ├── components/ui/      # Shadcn UI 组件库
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   └── utils.ts        # 通用工具函数 (cn)
│   └── server.ts           # 自定义服务端入口
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
├── requirements.txt        # Python依赖列表
└── tsconfig.json           # TypeScript 配置
```

- 项目文件（如 app 目录、pages 目录、components 等）默认初始化到 `src/` 目录下。

## 包管理规范

### Node.js依赖（前端）
**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

### Python依赖（后端处理）
项目使用Python脚本处理Excel和Word文件，依赖列表在 `requirements.txt` 文件中。
**常用命令**：
- 安装Python依赖：`pip3 install -r requirements.txt`
- 查看已安装依赖：`pip3 list | grep -E 'openpyxl|python-docx'`

**当前Python依赖**：
- openpyxl==3.1.2 (Excel文件读写)
- python-docx==1.1.0 (Word文件读写)

## 开发规范

- **项目理解加速**：初始可以依赖项目下`package.json`文件理解项目类型，如果没有或无法理解退化成阅读其他文件。
- **Hydration 错误预防**：严禁在 JSX 渲染逻辑中直接使用 typeof window、Date.now()、Math.random() 等动态数据。必须使用 'use client' 并配合 useEffect + useState 确保动态内容仅在客户端挂载后渲染；同时严禁非法 HTML 嵌套（如 <p> 嵌套 <div>）。

## Python脚本说明

### 核心脚本：process_excel_word.py
**位置**：`scripts/process_excel_word.py`

**功能**：处理Excel数据并填充到Word模板，生成格式化的报价文档。

**主要流程**：
1. 读取Excel文件（使用openpyxl）
2. 提取关键单元格数据（A1, A3, L3, C5, J3, J6, R3等）
3. 读取第10行开始的明细数据
4. 统计合计数据（未税合计、税额合计、含税合计）
5. 按税率分类统计（13%商品、6%服务）
6. 读取Word模板（使用python-docx）
7. 替换占位符并格式化文档
8. 生成新的Word文档

**Excel列映射**：
| Excel列 | 字段名 | Word列 | 说明 |
|---------|--------|--------|------|
| G列 | HSDJ | 第5列 | 含税单价（添加￥符号） |
| J列 | WSJE | 第7列 | 未税金额（添加￥符号） |
| L列 | HSJE | 第8列 | 含税金额（添加￥符号） |

**调用方式**：
```bash
python3 scripts/process_excel_word.py <excel文件路径> <word模板路径> <输出目录>
```

### 工具脚本：check_excel_detail.py
**位置**：`scripts/check_excel_detail.py`

**功能**：检查Excel第10行开始的详细数据，用于调试和验证数据格式。

**调用方式**：
```bash
python3 scripts/check_excel_detail.py <xlsx文件路径>
```

## 文件系统说明

### 临时文件目录
- **路径**：`/tmp/excel-word-temp/`
- **用途**：存储上传的Excel和Word模板文件（临时文件）
- **权限**：可读写（生产环境唯一可写入目录）
- **清理**：系统定期清理，不应存储重要数据

### 输出文件目录
- **路径**：`public/generated-docs/`
- **用途**：存储生成的Word文档
- **访问**：可通过 `/generated-docs/<文件名>` 路径访问和下载
- **持久性**：永久保存（除非手动删除）

## 环境配置

### 关键环境变量
| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `COZE_WORKSPACE_PATH` | 项目根目录（自动设置） | `/workspace/projects` |
| `DEPLOY_RUN_PORT` | 服务监听端口 | `5000` |
| `NODE_ENV` | 运行环境 | `development` 或 `production` |

### 路径适配机制

项目使用 `COZE_WORKSPACE_PATH` 环境变量统一管理路径，确保在开发和生产环境中都能正确找到文件：

**开发环境**（/workspace/projects）：
```
COZE_WORKSPACE_PATH=/workspace/projects
脚本路径：/workspace/projects/scripts/process_excel_word.py
输出目录：/workspace/projects/public/generated-docs/
```

**生产环境**（/opt/bytefaas）：
```
COZE_WORKSPACE_PATH=/opt/bytefaas
脚本路径：/opt/bytefaas/scripts/process_excel_word.py
输出目录：/opt/bytefaas/public/generated-docs/
```

### 环境变量设置
```bash
# 开发环境（自动设置）
export COZE_WORKSPACE_PATH="/workspace/projects"

# 生产环境（自动设置）
export COZE_WORKSPACE_PATH="/opt/bytefaas"
```

> **注意**：环境变量在启动脚本中自动设置，通常无需手动配置。


## UI 设计与组件规范 (UI & Styling Standards)

- 模板默认预装核心组件库 `shadcn/ui`，位于`src/components/ui/`目录下
- Next.js 项目**必须默认**采用 shadcn/ui 组件、风格和规范，**除非用户指定用其他的组件和规范。**


