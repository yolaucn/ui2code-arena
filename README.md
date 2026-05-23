# UI2Code Arena

UI2Code Arena 是 `UI2Code Subnet` 的开源演示项目。

它展示的不是一个已经完整上线的 Bittensor 子网，而是一个面向 `UI design -> frontend code` 场景的 **benchmark arena / subnet dashboard prototype**：用可视化方式解释这个子网为什么成立、如何评分、如何分配激励，以及验证者如何做反作弊。

对应提案文档：[`演讲/ui_2_code_subnet_proposal.md`](../演讲/ui_2_code_subnet_proposal.md)

## Why This Exists

前端开发里有大量重复性的 UI 还原工作：

- 设计稿、截图、Figma frame 需要被翻译成可运行代码
- 这个任务高频、成本高，而且天然适合自动化
- 相比很多模糊的 coding task，UI to Code 更容易做客观评分

`UI2Code Subnet` 的核心想法是：

> 让矿工竞争性地把 UI 设计图转成前端代码，再由验证者通过渲染、比对、可执行性检查和质量指标自动评分。

这个仓库的作用，是把这个想法先做成一个用户能看懂、能跑起来、能演示的产品原型。

## What The Demo Shows

当前版本主要包含 4 个部分：

### 1. 矿工排行榜

- 展示 subnet 基础信息、区块、矿工数量和轮次奖励
- 展示矿工得分、延迟、权重、TAO 收益和状态
- 支持查看单个矿工的历史趋势与反作弊指标
- 优先读取 `taostats.io` 数据，失败时自动回退到高保真 mock 数据

### 2. 激励曲线模拟器

- 调整“准确率权重 / 速度权重”
- 调整总奖励池与矿工数量
- 实时观察 `score^2` 奖励分配曲线
- 用交互方式解释为什么更高质量的矿工会获得非线性更高回报

### 3. 评测任务发布页

- 模拟 buyer / validator 发布 benchmark task
- 配置评测领域、维度、题量和 TAO 预算
- 预览任务信息和预计完成时间
- 以 demo 方式展示任务状态从 `pending -> running -> completed`

### 4. 反作弊机制面板

- 陷阱题设计
- 历史一致性检测
- 惩罚日志
- 对异常矿工做权重衰减的可视化表达

## Current Scope

当前仓库是一个 **概念验证 Demo**，已经实现的是：

- 前端可视化控制台
- Node/Express mock API
- taostats 数据接入与缓存
- mock 矿工数据生成
- 任务发布与状态流转的内存模拟

当前还 **没有** 实现：

- 真正的 UI 图片上传与代码生成
- miner 真实推理协议
- validator sandbox 执行器
- 自动截图、视觉相似度评测、Lighthouse 打分
- Bittensor 链上权重提交

所以更准确地说，这个项目现在是：

> UI2Code Subnet 的开源展示层与产品原型。

## Tech Stack

- `React 18`
- `Vite`
- `Tailwind CSS`
- `Node.js`
- `Express`
- `axios`
- `node-cache`

## Project Structure

```text
ui2code-arena/
├─ client/                  # React + Vite frontend
│  ├─ src/components/       # Header 等基础组件
│  ├─ src/pages/            # 排行榜 / 模拟器 / 任务 / 反作弊页面
│  ├─ src/hooks/            # subnet / task 数据 hooks
│  └─ src/lib/api.js        # 前端 API 封装
├─ server/
│  ├─ index.js              # Express 入口
│  ├─ routes.js             # API 路由
│  ├─ bittensorService.js   # taostats 拉取 + mock 回退 + 缓存
│  └─ mockData.js           # demo 矿工与 subnet mock 数据
├─ package.json
└─ README.md
```

## Quick Start

### 1. Install

```bash
cd ui2code-arena
npm install
cd client
npm install
```

也可以直接执行：

```bash
cd ui2code-arena
npm run install:all
```

### 2. Optional environment variables

在 `ui2code-arena/` 下创建 `.env`：

```bash
PORT=3001
SUBNET_ID=99
CACHE_TTL=12
TAOSTATS_BASE_URL=https://api.taostats.io/api
TAOSTATS_API_KEY=your_api_key_here
```

说明：

- 不配置 `TAOSTATS_API_KEY` 时，服务会自动回退到 mock 数据
- 前端默认运行在 `http://localhost:5173`
- Vite 已将 `/api` 代理到 `http://localhost:3001`

### 3. Run

```bash
cd ui2code-arena
npm run dev
```

启动后访问：

- `http://localhost:5173` 前端界面
- `http://localhost:3001/api/health` API 健康检查

## API Overview

当前 demo 暴露的接口：

- `GET /api/health`
- `GET /api/subnet`
- `GET /api/neurons`
- `GET /api/neurons/:uid`
- `GET /api/tasks`
- `POST /api/tasks`

`POST /api/tasks` 目前只做内存级模拟，不会持久化，也不会触发真实 benchmark。

## Scoring Logic Behind The Proposal

根据提案，v1 的目标评分公式是：

```text
Score = 0.50 × Visual Fidelity
      + 0.30 × Code Executability
      + 0.20 × Performance & Quality
```

这个 demo 重点可视化了其中三类核心思想：

- 视觉还原度是最重要指标
- 代码必须先能跑，再谈性能和奖励
- 激励最好是非线性的，促使矿工持续优化而不是停留在及格线附近

## Roadmap

下一步如果继续把它从 demo 推向可用 subnet prototype，比较自然的顺序是：

1. 接入真实的 `UI screenshot -> code generation` pipeline
2. 增加 validator sandbox，自动安装依赖、构建、渲染和截图
3. 引入视觉相似度评分与 OCR / layout 对齐检查
4. 输出可下载代码包与 benchmark report
5. 把任务协议、miner response 和 validator scoring 标准化
6. 再往后才是更完整的链上 subnet 集成

## Positioning

UI2Code 不想只做一个“截图生成页面”的小工具。

它更想验证一件事：

> `UI-to-Code` 这种高频、可评测、对延迟相对宽容的任务，是否可以成为一个真正适合去中心化推理市场的 AI 子网。

如果你对以下方向感兴趣，这个项目值得继续一起做：

- Bittensor subnet design
- AI coding infrastructure
- UI screenshot to code
- benchmark / validator system
- anti-cheat for open inference networks

## Related Document

- [`ui_2_code_subnet_proposal.md`](ui_2_code_subnet_proposal.md)

