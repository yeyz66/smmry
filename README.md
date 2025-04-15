# SummryAI - AI Text Summarization Tool

SummryAI是一个使用人工智能技术快速总结长文本内容的网站应用。用户可以粘贴或输入文本，并获得简洁的摘要，从而节省阅读时间并提高理解效率。

## 功能特点

- 快速总结：几秒钟内获得任何长度或复杂度的内容的简明摘要
- 自定义选项：调整摘要长度、风格和复杂度
- 支持多种格式：总结文章、研究论文、报告、新闻等
- 导出选项：以PDF、Word或文本格式下载摘要，或立即分享
- 用户友好的界面：简洁明了的设计，操作直观

## 技术栈

- **前端框架**: Next.js (App Router)
- **样式**: Tailwind CSS v4
- **API**: Next.js API Routes
- **表单处理**: React Hook Form + Zod
- **HTTP客户端**: Axios
- **图标**: Lucide React

## 开始使用

### 前提条件

- Node.js 18.0或更高版本
- npm 或 cnpm

### 安装

1. 克隆仓库

```bash
git clone https://github.com/yourusername/smmry-ai.git
cd smmry-ai
```

2. 安装依赖

```bash
cnpm install
```

3. 运行开发服务器

```bash
cnpm run dev
```

4. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
smmry-app/
├── src/
│   ├── app/                # Next.js App Router目录
│   │   ├── api/            # API路由
│   │   ├── auth/           # 认证页面
│   │   ├── guide/          # 用户指南页面
│   │   ├── history/        # 历史记录页面
│   │   ├── settings/       # 设置页面
│   │   ├── summarize/      # 主要总结功能页面
│   │   ├── page.tsx        # 首页
│   │   └── layout.tsx      # 根布局
│   ├── components/         # React组件
│   │   ├── layout/         # 布局组件
│   │   └── ui/             # UI组件
│   ├── hooks/              # 自定义React钩子
│   └── lib/                # 工具函数和库
└── public/                 # 静态资源
```

## 生产部署

构建生产版本：

```bash
cnpm run build
```

运行生产服务器：

```bash
cnpm start
```

## 许可证

[MIT](LICENSE)
