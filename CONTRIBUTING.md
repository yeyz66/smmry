# 贡献指南

感谢您对 SummryAI 项目的关注！我们欢迎任何形式的贡献，包括但不限于功能建议、错误报告、代码改进和文档完善。

## 开发环境设置

1. Fork 并克隆仓库:

```bash
git clone https://github.com/yourusername/smmry-ai.git
cd smmry-ai
```

2. 安装依赖:

```bash
cnpm install
```

3. 启动开发服务器:

```bash
cnpm run dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 上运行。

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

## 贡献流程

1. 确保你的代码基于最新的 main 分支
2. 创建一个新的分支: `git checkout -b feature/your-feature-name`
3. 编写代码并遵循我们的代码风格
4. 提交你的更改: `git commit -m 'Add some feature'`
5. 推送到分支: `git push origin feature/your-feature-name`
6. 提交一个 Pull Request

## 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 配置的代码风格
- 组件使用函数式组件和 Hooks
- 保持简洁的代码结构和清晰的命名
- 为函数和复杂组件添加适当的注释

## 提交 Pull Request

提交 PR 时，请:

1. 解释你的更改以及它们解决了什么问题
2. 附上任何相关的截图或 GIF（如适用）
3. 确保 CI 测试通过
4. 关联任何相关的 issue

## 报告 Bug

如果你发现了 bug，请创建一个 issue 并提供:

- 清晰的问题描述
- 重现问题的步骤
- 预期行为和实际行为
- 相关截图
- 环境信息（浏览器、操作系统等）

## 功能请求

如果你有新功能建议，请创建一个 issue:

- 使用清晰、描述性的标题
- 详细描述功能以及它将如何工作
- 解释为什么这个功能对用户有价值
- 如果可能，提供设计模型或线框图

## 许可证

通过提交代码，你同意你的贡献将在项目的许可证下发布。 