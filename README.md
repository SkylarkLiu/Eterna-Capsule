# 永恒胶囊 (Eterna Capsule)

一个基于 Vue 3 + Vite + uni-app 前端和 NestJS 后端开发的数字记忆守护应用，采用「静谧数字主义」设计风格。

## 项目简介

永恒胶囊是一个专注于数字记忆管理的应用，旨在帮助用户存储和守护重要的情感记忆、数字资产和遗嘱信息。通过独特的「守护兽」交互界面，为用户提供温馨而科技感的使用体验。

## 技术栈

### 前端 (eterna-app)

- **框架**：Vue 3 + Vite + uni-app
- **状态管理**：Pinia
- **HTTP 客户端**：Axios
- **样式方案**：UnoCSS
- **设计风格**：静谧数字主义 (Silent Digitalism)

### 后端 (eterna-server)

- **框架**：NestJS
- **数据库**：SQLite (TypeORM)
- **认证**：JWT + Passport
- **API 文档**：Swagger

## 核心功能

### 1. 用户系统

- 邮箱/手机号注册登录
- JWT Token 认证
- 个人资料管理

### 2. 守护兽系统

- 互动式守护兽界面
- 能量状态监控
- 智能对话交互（支持 LLM 接入）
- 语音输入功能
- **消息排序与分页**：历史消息按时间正序排列，支持分页加载
- **全局搜索**：支持关键词搜索聊天记录
- **实时对话**：打字机效果与思考态占位符
- **头像元数据**：用户头像展示与视觉增强
- **长期记忆**：对话记忆自动压缩与存储

### 3. 情感胶囊

- 创建和管理数字记忆胶囊
- 3D卡片堆叠效果
- 粒子动画效果
- 加密状态显示

### 4. 系统设置

- 个人资料管理
- 通知设置
- 隐私设置
- 关于应用

## 设计风格

### 静谧数字主义 (Silent Digitalism)

**色调 (Palette)**：

- 主色：极夜黑 (#0A0A0A) 与 星云灰 (#1A1A1A)
- 点缀色（生命力）：荧光绿 (#C1FF72) 或 冰晶蓝 (#00F2FF)
- 警告色：余烬橘 (#FF5C00)

**材质 (Textures)**：

- 大量使用玻璃拟态 (Glassmorphism) 和磨砂半透明效果
- 营造数字胶囊的悬浮感
- **底部悬浮式布局**：对话预览区、预设短语、输入框和功能菜单栏整合在底部容器
- **渐变背景阴影处理**：底部容器使用线性渐变背景，营造"漂浮"视觉效果

**字体 (Typography)**：

- 标题：无衬线、等宽字体，展现科技感
- 正文：优雅的衬线体，提供纸质般的温润感

## 项目结构

```
├── eterna-app/              # 前端项目
│   ├── src/
│   │   ├── api/             # API 接口
│   │   ├── components/      # 公共组件
│   │   ├── pages/           # 页面组件
│   │   │   ├── index/       # 首页
│   │   │   ├── login/       # 登录注册页
│   │   │   ├── sentinel/    # 守护兽页面
│   │   │   ├── capsule/     # 胶囊管理页面
│   │   │   └── settings/    # 设置页面
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── App.vue          # 根组件
│   │   └── main.ts          # 应用入口
│   ├── index.html           # HTML 入口
│   ├── package.json         # 项目依赖
│   ├── tsconfig.json        # TypeScript 配置
│   ├── uno.config.ts        # UnoCSS 配置
│   └── vite.config.ts       # Vite 配置
│
├── eterna-server/           # 后端项目
│   ├── src/
│   │   ├── common/          # 公共模块
│   │   │   ├── decorators/  # 自定义装饰器
│   │   │   ├── filters/     # 异常过滤器
│   │   │   ├── guards/      # 认证守卫
│   │   │   └── strategies/  # JWT 策略
│   │   ├── entities/        # 数据库实体
│   │   ├── modules/         # 业务模块
│   │   │   ├── auth/        # 认证模块
│   │   │   └── user/        # 用户模块
│   │   ├── app.module.ts    # 应用模块
│   │   └── main.ts          # 应用入口
│   ├── .env.example         # 环境变量示例
│   ├── eterna.db            # SQLite 数据库
│   └── package.json         # 项目依赖
│
├── docker-compose.yml       # Docker 配置
└── README.md                # 项目说明
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
# 安装前端依赖
cd eterna-app
npm install

# 安装后端依赖
cd ../eterna-server
npm install
```

### 配置环境变量

```bash
cd eterna-server
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库配置
DATABASE_TYPE=sqlite
DATABASE_NAME=eterna.db

# JWT 配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# 应用配置
APP_PORT=3000
APP_ENV=development

# LLM 配置 (支持 OpenAI 兼容 API，如智谱 GLM、DeepSeek 等)
# 智谱 GLM 格式: id.secret
LLM_API_KEY=your_llm_api_key
LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4
LLM_MODEL=glm-4-flash
```

### 启动开发服务器

```bash
# 启动后端服务 (在 eterna-server 目录)
npm run start:dev

# 启动前端服务 (在 eterna-app 目录)
npm run dev:h5
```

### 访问地址

- 前端：<http://localhost:5173>
- 后端 API：<http://localhost:3000/api>
- API 文档：<http://localhost:3000/api/docs>

## API 接口

### 认证模块

| 方法   | 路径                 | 描述   |
| ---- | ------------------ | ---- |
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login    | 用户登录 |

### 用户模块

| 方法    | 路径                | 描述       |
| ----- | ----------------- | -------- |
| GET   | /api/users/me     | 获取当前用户信息 |
| PATCH | /api/users/update | 更新用户信息（含 heartbeatGraceDays 心跳宽限天数）|

### 守护兽模块

| 方法   | 路径                      | 描述                         |
| ---- | ----------------------- | -------------------------- |
| GET  | /api/sentinel/messages  | 获取守护兽消息历史（分页，按时间正序）       |
| POST | /api/sentinel/chat      | 发送消息并获取AI回复               |
| GET  | /api/sentinel/search    | 全局搜索聊天记录（支持关键词和日期筛选）      |
| GET  | /api/sentinel/energy    | 获取守护兽能量状态                  |

## 构建生产版本

```bash
# 构建前端
cd eterna-app
npm run build:h5

# 构建后端
cd ../eterna-server
npm run build
```

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

## 许可证

MIT License

## 最近更新

- **LLM 集成**：支持配置 OpenAI 兼容的 LLM API（智谱 GLM、DeepSeek 等）
- **JWT Token 认证**：自动生成智谱 AI JWT Token，支持 id.secret 格式 API Key
- **对话修复**：修复消息重复显示问题，优化打字机效果
- **中文本地化**：Fallback 响应改为中文

## 联系方式

- 项目地址：<https://github.com/SkylarkLiu/Eterna-Capsule>
- 作者：SkylarkLiu

## 更多内容

更多内容可关注作者公众号：

![公众号](./gongzhonghao.jpg)

***

永恒胶囊 · 守护你的数字记忆
