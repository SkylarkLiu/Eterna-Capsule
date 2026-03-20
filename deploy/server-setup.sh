#!/bin/bash

# ============================================
# Eterna 后端部署脚本
# 在云服务器上执行
# ============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Eterna 后端部署脚本 ===${NC}"

# 1. 创建项目目录
echo -e "${YELLOW}[1/5] 创建项目目录...${NC}"
mkdir -p /opt/eterna
cd /opt/eterna

# 2. 克隆代码仓库
echo -e "${YELLOW}[2/5] 克隆代码仓库...${NC}"
if [ ! -d "Eterna-Capsule" ]; then
    git clone https://github.com/SkylarkLiu/Eterna-Capsule.git
else
    echo "代码已存在，执行更新..."
    cd Eterna-Capsule
    git pull
fi

cd /opt/eterna/Eterna-Capsule

# 3. 创建环境变量文件
echo -e "${YELLOW}[3/5] 配置环境变量...${NC}"
cat > .env << 'EOF'
# ============================================
# 请根据实际情况修改以下配置
# ============================================

# 服务端口
PORT=3000
NODE_ENV=production

# JWT 密钥（请修改为随机字符串）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 数据库配置（SQLite，数据持久化到 Docker Volume）
DB_TYPE=sqlite
DB_DATABASE=data/eterna.db

# LLM API 配置（请修改为你的 API Key）
LLM_API_KEY=your-zhipu-api-key
LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4
LLM_MODEL=glm-5

# 前端地址（用于 CORS）
FRONTEND_URL=https://eterna.你的域名.com

# TypeORM 配置
APP_ENV=production
EOF

echo -e "${RED}⚠️  请编辑 /opt/eterna/Eterna-Capsule/.env 文件，填入正确的配置！${NC}"
echo -e "${RED}   特别是：JWT_SECRET、LLM_API_KEY、FRONTEND_URL${NC}"

# 4. 创建数据持久化目录
echo -e "${YELLOW}[4/5] 创建数据目录...${NC}"
mkdir -p data uploads

# 5. 提示下一步
echo -e "${YELLOW}[5/5] 下一步操作...${NC}"
echo -e "${GREEN}代码已克隆到 /opt/eterna/Eterna-Capsule${NC}"
echo ""
echo "请执行以下步骤："
echo "1. 编辑环境变量: nano /opt/eterna/Eterna-Capsule/.env"
echo "2. 启动 Docker: cd /opt/eterna/Eterna-Capsule && docker-compose up -d"
echo "3. 配置 Nginx 反向代理"
