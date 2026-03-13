# 永恒胶囊后端服务 (Eterna Server)

永恒胶囊的后端 API 服务，基于 NestJS + TypeORM + PostgreSQL 构建。

## 技术栈

- **框架**: NestJS 10
- **ORM**: TypeORM
- **数据库**: PostgreSQL
- **认证**: JWT + Passport
- **密码加密**: bcrypt
- **API 文档**: Swagger

## 项目结构

```
src/
├── common/                 # 公共模块
│   ├── decorators/         # 自定义装饰器
│   │   ├── current-user.decorator.ts
│   │   └── public.decorator.ts
│   ├── filters/            # 异常过滤器
│   │   └── all-exceptions.filter.ts
│   ├── guards/             # 守卫
│   │   └── jwt-auth.guard.ts
│   └── strategies/         # 策略
│       └── jwt.strategy.ts
├── entities/               # 数据库实体
│   └── user.entity.ts
├── modules/                # 业务模块
│   ├── auth/               # 认证模块
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── auth-response.dto.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   └── user/               # 用户模块
│       ├── dto/
│       │   └── update-user.dto.ts
│       ├── user.controller.ts
│       ├── user.service.ts
│       └── user.module.ts
├── app.module.ts           # 应用模块
└── main.ts                 # 应用入口
```

## 环境配置

1. 复制环境变量示例文件：

```bash
cp .env.example .env
```

2. 修改 `.env` 文件中的配置：

```env
# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=eterna_db

# JWT 配置
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

# 应用配置
APP_PORT=3000
APP_ENV=development
```

## 安装与运行

### 安装依赖

```bash
npm install
```

### 创建数据库

确保 PostgreSQL 已安装并运行，然后创建数据库：

```sql
CREATE DATABASE eterna_db;
```

### 运行开发服务器

```bash
npm run start:dev
```

### 构建生产版本

```bash
npm run build
npm run start:prod
```

## API 文档

启动服务后，访问 Swagger API 文档：

```
http://localhost:3000/api/docs
```

## API 接口

### 认证接口

#### 注册

```
POST /api/auth/register
```

请求体：
```json
{
  "email": "user@example.com",
  "phone": "13800138000",
  "password": "password123",
  "username": "永恒旅者"
}
```

响应：
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "phone": "13800138000",
    "username": "永恒旅者",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 登录

```
POST /api/auth/login
```

请求体：
```json
{
  "account": "user@example.com",
  "password": "password123"
}
```

响应：
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "phone": "13800138000",
    "username": "永恒旅者",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2024-01-01T01:00:00.000Z"
  }
}
```

### 用户接口

> 注意：以下接口需要在请求头中携带 JWT Token

```
Authorization: Bearer <accessToken>
```

#### 获取当前用户信息

```
GET /api/users/me
```

响应：
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "phone": "13800138000",
  "username": "永恒旅者",
  "avatarUrl": "https://example.com/avatar.jpg",
  "motto": "守护你的数字记忆",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "lastLoginAt": "2024-01-01T01:00:00.000Z"
}
```

#### 更新个人资料

```
PATCH /api/users/update
```

请求体：
```json
{
  "username": "新用户名",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "motto": "新的座右铭"
}
```

响应：
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "phone": "13800138000",
  "username": "新用户名",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "motto": "新的座右铭",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T02:00:00.000Z",
  "lastLoginAt": "2024-01-01T01:00:00.000Z"
}
```

## 数据库表结构

### users 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| email | VARCHAR(100) | 邮箱（唯一） |
| phone | VARCHAR(20) | 手机号（唯一） |
| password | VARCHAR(255) | 密码（加密） |
| username | VARCHAR(50) | 用户名 |
| avatarUrl | VARCHAR(500) | 头像URL |
| motto | VARCHAR(200) | 座右铭 |
| createdAt | TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | 更新时间 |
| lastLoginAt | TIMESTAMP | 最后登录时间 |

## 安全特性

- 密码使用 bcrypt 加密存储
- JWT Token 认证机制
- 全局异常过滤器统一处理错误
- 请求参数验证（class-validator）
- CORS 跨域支持

## 许可证

MIT License
