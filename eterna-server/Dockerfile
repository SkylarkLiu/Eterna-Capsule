# 构建阶段
FROM node:20-alpine AS builder

# 安装编译依赖(sqlite3 需要)
RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM node:20-alpine

# 安装运行时依赖
RUN apk add --no-cache dumb-init

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# 数据持久化目录
VOLUME ["/app/uploads", "/app/data"]

ENV NODE_ENV=production
ENV APP_ENV=production
ENV DATABASE_NAME=/app/data/eterna.db

EXPOSE 3000

# 使用 dumb-init 处理信号
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
