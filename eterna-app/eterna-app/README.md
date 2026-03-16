# 永恒胶囊 (Eterna Capsule)

一个基于 Vue 3 + Vite + uni-app 开发的数字记忆守护应用，采用「静谧数字主义」设计风格。

## 项目简介

永恒胶囊是一个专注于数字记忆管理的应用，旨在帮助用户存储和守护重要的情感记忆、数字资产和遗嘱信息。通过独特的「守护兽」交互界面，为用户提供温馨而科技感的使用体验。

## 技术栈

- **前端框架**：Vue 3 + Vite + uni-app
- **状态管理**：Pinia
- **样式方案**：UnoCSS
- **设计风格**：静谧数字主义 (Silent Digitalism)

## 核心功能

### 1. 守护兽系统
- 互动式守护兽界面
- 能量状态监控
- 智能对话交互
- 语音输入功能

### 2. 情感胶囊
- 创建和管理数字记忆胶囊
- 3D卡片堆叠效果
- 粒子动画效果
- 加密状态显示

### 3. 系统设置
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

**字体 (Typography)**：
- 标题：无衬线、等宽字体，展现科技感
- 正文：优雅的衬线体，提供纸质般的温润感

## 项目结构

```
├── src/
│   ├── pages/             # 页面组件
│   │   ├── index/         # 首页
│   │   ├── sentinel/      # 守护兽页面
│   │   ├── capsule/       # 胶囊管理页面
│   │   └── settings/      # 设置页面
│   ├── stores/            # Pinia 状态管理
│   │   ├── sentinel.ts    # 守护兽状态
│   │   ├── capsule.ts     # 胶囊状态
│   │   └── index.ts       # 状态管理入口
│   ├── App.vue            # 根组件
│   ├── main.ts            # 应用入口
│   ├── manifest.json      # 应用配置
│   └── pages.json         # 页面路由配置
├── index.html             # HTML 入口
├── package.json           # 项目依赖
├── tsconfig.json          # TypeScript 配置
├── uno.config.ts          # UnoCSS 配置
└── vite.config.ts         # Vite 配置
```

## 开发环境

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
# H5 端
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin

# 其他平台
npm run dev:mp-alipay    # 支付宝小程序
npm run dev:mp-baidu     # 百度小程序
npm run dev:mp-toutiao   # 头条小程序
```

### 构建生产版本

```bash
# H5 端
npm run build:h5

# 微信小程序
npm run build:mp-weixin

# 其他平台
npm run build:mp-alipay    # 支付宝小程序
npm run build:mp-baidu     # 百度小程序
npm run build:mp-toutiao   # 头条小程序
```

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

## 许可证

MIT License

## 联系方式

- 项目地址：https://github.com/SkylarkLiu/Eterna-Capsule
- 作者：SkylarkLiu

---

永恒胶囊 · 守护你的数字记忆