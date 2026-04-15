# 腾讯云 Ubuntu 24.04 生产部署指南

适用项目：`Next.js + Node.js + Python(openpyxl/python-docx)`

## 1. 安装系统依赖

```bash
sudo apt update
sudo apt install -y nginx python3 python3-pip curl git build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
corepack enable
corepack prepare pnpm@9.0.0 --activate
```

## 2. 拉取 Gitee 代码

```bash
sudo mkdir -p /var/www
sudo chown -R "$USER":"$USER" /var/www
cd /var/www
git clone https://gitee.com/angel20080521/EXCELtoWORD.git
cd /var/www/EXCELtoWORD/projects
```

## 3. 安装依赖并构建

```bash
pnpm install --frozen-lockfile
python3 -m pip install -r requirements.txt
pnpm build
```

## 4. 使用 PM2 启动

```bash
cd /var/www/EXCELtoWORD/projects
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

验证：

```bash
curl -I http://127.0.0.1:5000
pm2 status
pm2 logs excel-to-word --lines 100
```

## 5. 配置 Nginx

```bash
sudo cp deploy/nginx.exceltoword.conf /etc/nginx/sites-available/exceltoword.conf
sudo ln -sf /etc/nginx/sites-available/exceltoword.conf /etc/nginx/sites-enabled/exceltoword.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

如果你有域名，请把 `deploy/nginx.exceltoword.conf` 里的 `server_name _;` 改成你的域名。

## 6. 开启防火墙/安全组

腾讯云安全组至少放行：

- `22` (SSH)
- `80` (HTTP)
- `443` (HTTPS)

## 7. 配置 HTTPS（可选但强烈建议）

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 8. 更新部署

以后更新代码可直接执行：

```bash
cd /var/www/EXCELtoWORD
git pull
cd /var/www/EXCELtoWORD/projects
bash ./scripts/deploy_production.sh
```

## 9. 常见排查命令

```bash
pm2 logs excel-to-word --lines 200
pm2 restart excel-to-word
sudo journalctl -u nginx -n 100 --no-pager
sudo nginx -t
curl -I http://127.0.0.1:5000
```
