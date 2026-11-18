# VIBE LAB · Vibe Coding 实验室工作流

> 从一句想法，到一个能上线的产品。一套可交互的 Vibe Coding 学习地图与标准开发工作流。

**线上地址**：<https://sky-blue-ai.github.io/vibe-coding-repo/>

## 它是什么

- **交互式学习地图**：11 个章节，覆盖从「认识 Vibe Coding」到「部署迭代维护」的完整路径
- **标准开发工作流**：10 步 4 阶段（准备 → 视觉 → 开发 → 交付）的可复用建站流程
- **项目实战**：4 个由易到难的实战项目（小游戏 → 全栈工具 → AI SaaS → Agent）
- **Prompt 模板库**：6 个可直接复制使用的 AI 协作模板
- **交付检查清单**：上线前逐项打勾，勾选进度自动保存在浏览器

## 技术栈

| 层 | 选型 |
|---|---|
| 前端 | React 18 + Vite 6 + Tailwind CSS 4 |
| 内容 | GitHub 即 CMS：内容存仓库 `content/*.json`，页面运行时动态读取 |
| 管理台 | 站内 `#/admin` 路由，通过 GitHub Contents API 在线发布内容 |
| 部署 | GitHub Pages，CI 自动构建（push main → npm ci → build → deploy） |

## 项目结构

```
├── index.html                  # Vite 入口
├── vite.config.js              # base=/vibe-coding-repo/，React + Tailwind 插件
├── src/
│   ├── main.jsx                # 应用挂载
│   ├── App.jsx                 # 主站：侧边导航 + 各 section 组件
│   ├── Admin.jsx               # 内容管理台（连接仓库 / 表单 CRUD / 一键发布）
│   └── index.css               # Tailwind + 设计 token（浅色卡片风）
├── content/
│   ├── modules.json            # 核心知识模块（卡片数据）
│   ├── projects.json           # 项目实战卡片
│   └── prompts.json            # Prompt 模板
└── .github/workflows/deploy-pages.yml   # CI：构建并部署到 Pages
```

## 内容数据格式

### `content/modules.json`

```json
[
  {
    "icon": "✳",
    "title": "M1 · 认识 Vibe Coding",
    "summary": "一句话简介",
    "points": ["要点 1", "要点 2"],
    "output": "学完的产出物"
  }
]
```

### `content/projects.json`

```json
[
  {
    "title": "项目名",
    "color": "#e07a5f",
    "desc": "描述",
    "chips": ["标签1", "标签2"],
    "prep": ["要做的准备（可空数组）"]
  }
]
```

### `content/prompts.json`

```json
[
  { "title": "模板标题", "color": "#5fb87a", "prompt": "模板正文，【】为占位符" }
]
```

## 如何更新内容

### 方式一：在线管理台（推荐）

1. 打开站点 → 右上角「⚙ 管理内容」（或直接访问 `#/admin`）
2. 粘贴 GitHub Token（需 **Contents: Read and write** 权限，仅存浏览器 localStorage）
3. 表单创建 / 编辑 / 排序 / 删除 → 点「🚀 发布全部改动」
4. CI 自动构建部署，1–2 分钟生效

### 方式二：直接改 JSON

编辑 `content/*.json` 后提交到 `main` 分支，CI 自动发布。

## 本地开发

```bash
npm install       # 安装依赖
npm run dev       # 开发服务器（热更新）
npm run build     # 构建到 dist/
npm run preview   # 本地预览构建产物（base 路径 /vibe-coding-repo/）
```

> 注意：本地 `content/*.json` 即真实内容源；管理台发布的改动会直接提交到本仓库。

## 部署

GitHub Pages + GitHub Actions：

- 触发：push 到 `main` 或手动 `workflow_dispatch`
- 流程：`npm ci → npm run build → 部署 dist/`
- 每次发布对应一条 commit，出问题可回退（revert 即回滚站点）

## 安全须知

- ⚠️ 任何 GitHub Token / API Key 都不要提交进仓库
- 管理台的 Token 只存在编辑者自己的浏览器里；用完可在管理台「断开」
- 建议使用 Fine-grained PAT 并只勾选本仓库的 `Contents: Read and write`

## License

MIT
