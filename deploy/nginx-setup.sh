#!/bin/bash

# ============================================
# Nginx + SSL 证书配置脚本
# 使用 Certbot 自动申请 Let's Encrypt 证书
# ============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 请修改为你的域名
DOMAIN="eterna.你的域名.com"
EMAIL="你的邮箱@example.com"

echo -e "${GREEN}=== Nginx + SSL 配置 ===${NC}"

# 1. 安装 Nginx
echo -e "${YELLOW}[1/4] 安装 Nginx...${NC}"
if command -v apt-get &> /dev/null; then
    apt update
    apt install -y nginx certbot python3-certbot-nginx
elif command -v yum &> /dev/null; then
    yum install -y nginx certbot python3-certbot-nginx
fi

# 2. 创建 Nginx 配置
echo -e "${YELLOW}[2/4] 创建 Nginx 配置...${NC}"
cat > /etc/nginx/sites-available/eterna << EOF
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name ${DOMAIN};
    
    # Allow Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS 配置（证书申请后启用）
# server {
#     listen 443 ssl http2;
#     server_name ${DOMAIN};
#
#     ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
#
#     # SSL 配置
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
#     ssl_prefer_server_ciphers off;
#
#     # 反向代理到 Docker 后端
#     location / {
#         proxy_pass http://127.0.0.1:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade \$http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host \$host;
#         proxy_set_header X-Real-IP \$remote_addr;
#         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto \$scheme;
#         proxy_cache_bypass \$http_upgrade;
#         
#         # 超时配置（LLM API 可能需要较长时间）
#         proxy_connect_timeout 60s;
#         proxy_send_timeout 60s;
#         proxy_read_timeout 60s;
#     }
# }
EOF

# 启用配置
ln -sf /etc/nginx/sites-available/eterna /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试配置
nginx -t && systemctl reload nginx

# 3. 申请 SSL 证书
echo -e "${YELLOW}[3/4] 申请 SSL 证书...${NC}"
echo -e "${RED}请确保域名已解析到此服务器！${NC}"
read -p "域名 ${DOMAIN} 是否已解析到此服务器？(y/n): " confirm

if [ "$confirm" = "y" ]; then
    # 创建 certbot webroot 目录
    mkdir -p /var/www/certbot
    
    # 申请证书
    certbot certonly --webroot \
        -w /var/www/certbot \
        -d ${DOMAIN} \
        --email ${EMAIL} \
        --agree-tos \
        --no-eff-email
    
    # 4. 启用 HTTPS 配置
    echo -e "${YELLOW}[4/4] 启用 HTTPS 配置...${NC}"
    cat > /etc/nginx/sites-available/eterna << EOF
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name ${DOMAIN};
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;

    # 反向代理到 Docker 后端
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # 超时配置（LLM API 可能需要较长时间）
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF
    
    # 重新加载 Nginx
    nginx -t && systemctl reload nginx
    
    # 设置证书自动续期
    echo -e "${GREEN}设置证书自动续期...${NC}"
    systemctl enable certbot.timer || (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    echo -e "${GREEN}✅ 配置完成！${NC}"
    echo -e "访问地址: https://${DOMAIN}"
else
    echo -e "${RED}请先配置 DNS 解析，然后重新运行此脚本。${NC}"
fi
