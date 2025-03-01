# Deployment Guide for Zapp TV Redirect System

This guide explains how to deploy the Zapp TV redirect system to a production server.

## Prerequisites

- A Linux server (Ubuntu/Debian recommended)
- Node.js 18+ installed
- Nginx installed
- SSL certificates (Let's Encrypt recommended)

## Step 1: Build the React Application

On your development machine:

```bash
# Build the React app
npm run build
```

This will create a `dist` directory with optimized static files.

## Step 2: Set Up the Server

1. Create a directory for your application:

```bash
mkdir -p /var/www/zapp-tv
```

2. Copy your build files to the server:

```bash
# Using scp or rsync
scp -r dist/* user@your-server:/var/www/zapp-tv/
scp server.js package.json package-lock.json user@your-server:/var/www/zapp-tv/
```

3. Install production dependencies:

```bash
cd /var/www/zapp-tv
npm ci --production
```

## Step 3: Configure Nginx

1. Edit the Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/zapp-tv
```

2. Use the provided `nginx.conf` as a template, making these changes:
   - Update `server_name` to your domain
   - Update SSL certificate paths
   - Update the root path to `/var/www/zapp-tv/dist`

3. Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/zapp-tv /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 4: Set Up the Node.js Server as a Service

1. Create a systemd service file:

```bash
sudo nano /etc/systemd/system/zapp-tv.service
```

2. Add the following content (adjust paths and user as needed):

```
[Unit]
Description=Zapp TV Redirect Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/zapp-tv
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=PORT=3001
Environment=NODE_ENV=production
# Generate secure random keys for production
Environment=ENCRYPTION_KEY=your_secure_random_key
Environment=ENCRYPTION_IV=your_secure_random_iv

[Install]
WantedBy=multi-user.target
```

3. Start and enable the service:

```bash
sudo systemctl enable zapp-tv
sudo systemctl start zapp-tv
sudo systemctl status zapp-tv
```

## Step 5: Secure Your Server

1. Set up a firewall:

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

2. Install and configure fail2ban:

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Step 6: Set Up SSL with Let's Encrypt

If you don't have SSL certificates yet:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Step 7: Test Your Setup

Visit your domain in a browser and verify that:
1. The site loads correctly
2. Redirects work properly
3. No referrer information is leaked

## Troubleshooting

Check logs if you encounter issues:

```bash
# Nginx logs
sudo tail -f /var/log/nginx/error.log

# Node.js service logs
sudo journalctl -u zapp-tv -f
```