# DNS 解析配置指南

## 在域名服务商控制台添加 A 记录

| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|--------|-----|
| A | eterna | 你的服务器公网IP | 600 |
| A | @ | 你的服务器公网IP | 600 |

## 示例

假设：
- 域名：example.com
- 服务器IP：123.45.67.89

则配置：
- eterna.example.com → 123.45.67.89
- example.com → 123.45.67.89

## 验证 DNS 生效

```bash
# Windows
nslookup eterna.你的域名.com

# Linux/Mac
dig eterna.你的域名.com
```

等待 DNS 生效后（通常 10 分钟 ~ 2 小时），返回你的服务器 IP 即表示成功。
