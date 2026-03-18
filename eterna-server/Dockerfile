# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# 数据持久化目录
VOLUME ["/app/uploads", "/app/data"]

ENV NODE_ENV=production
ENV APP_ENV=development
ENV DATABASE_NAME=/app/data/eterna.db

EXPOSE 3000
CMD ["node", "dist/main.js"]
