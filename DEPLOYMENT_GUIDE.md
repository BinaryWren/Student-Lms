# LMS Deployment Guide: Binghost / VPS (Ubuntu)

This guide provides a step-by-step process for deploying the LMS application (Next.js Frontend & Django Backend) on a VPS/Cloud server (like Binghost, DigitalOcean, or AWS) running **Ubuntu 22.04+**.

---

## 1. Prerequisites

Before starting, ensure you have:
*   A **Binghost / VPS Server** (minimum 2GB RAM recommended).
*   A **Domain Name** (e.g., `lms.example.com`).
*   SSH access to your server.
*   The code uploaded to a GitHub/GitLab repository.

---

## 2. Server Initial Setup

Connect to your server via SSH:
```bash
ssh root@your_server_ip
```

Update system packages:
```bash
sudo apt update && sudo apt upgrade -y
```

Install essential dependencies:
```bash
sudo apt install -y python3-pip python3-venv nginx git curl build-essential libpq-dev
```

Install **Node.js 20+** (for Next.js):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

---

## 3. Database Selection (PostgreSQL)

While the app uses SQLite locally, **PostgreSQL** is recommended for production.

1.  Install PostgreSQL:
    ```bash
    sudo apt install -y postgresql postgresql-contrib
    ```
2.  Create a database and user:
    ```bash
    sudo -u postgres psql
    ```
    ```sql
    CREATE DATABASE lms_db;
    CREATE USER lms_user WITH PASSWORD 'your_secure_password';
    GRANT ALL PRIVILEGES ON DATABASE lms_db TO lms_user;
    \q
    ```

---

## 4. Backend Deployment (Django)

1.  **Clone the code**:
    ```bash
    mkdir -p /var/www/lms
    cd /var/www/lms
    git clone https://github.com/your-repo/lms.git .
    ```

2.  **Setup Virtual Environment**:
    ```bash
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    pip install gunicorn psycopg2-binary
    ```

3.  **Configure `.env`**:
    Create a `.env` file in `backend/`:
    ```bash
    DEBUG=False
    SECRET_KEY=your_production_secret_key
    DATABASE_URL=postgres://lms_user:your_secure_password@localhost:5432/lms_db
    ALLOWED_HOSTS=nanocyber.tech,your_server_ip
    CORS_ALLOWED_ORIGINS=https://nanocyber.tech
    ```

4.  **Migrations & Static Files**:
    ```bash
    python manage.py migrate
    python manage.py collectstatic --noinput
    ```

5.  **Setup Gunicorn Service**:
    Create `/etc/systemd/system/gunicorn.service`:
    ```ini
    [Unit]
    Description=gunicorn daemon
    After=network.target

    [Service]
    User=www-data
    Group=www-data
    WorkingDirectory=/var/www/lms/backend
    ExecStart=/var/www/lms/backend/venv/bin/gunicorn --workers 3 --bind unix:/run/gunicorn.sock config.wsgi:application

    [Install]
    WantedBy=multi-user.target
    ```
    ```bash
    sudo systemctl start gunicorn
    sudo systemctl enable gunicorn
    ```

---

## 5. Frontend Deployment (Next.js)

1.  **Install dependencies**:
    ```bash
    cd /var/www/lms
    npm install
    ```

2.  **Build the application**:
    Update `src/lib/api.ts` to point to your production URL:
    `const API_URL = 'https://nanocyber.tech/api';`

    ```bash
    npm run build
    ```

3.  **Process Management (PM2)**:
    Keep the Next.js server running in the background:
    ```bash
    sudo npm install -g pm2
    pm2 start npm --name "lms-frontend" -- start
    pm2 save
    pm2 startup
    ```

---

## 6. Nginx Configuration

Create `/etc/nginx/sites-available/lms`:
```nginx
server {
    listen 80;
    server_name nanocyber.tech;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn.sock;
    }

    # Backend Static Files
    location /static/ {
        root /var/www/lms/backend;
    }

    # Backend Media Files
    location /media/ {
        root /var/www/lms/backend;
    }
}
```

Enable the site and test Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/lms /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

---

## 7. SSL (HTTPS) via Certbot

```bash
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d nanocyber.tech
```

---

## 8. Summary Checklist
- [ ] Domain points to Server IP.
- [ ] firewall ports (80, 443, 22) are open.
- [ ] `DEBUG=False` in Django settings.
- [ ] Next.js pointing to production API URL.
- [ ] PostgreSQL setup and migrated.
- [ ] HTTPS enabled.

---
**Need help?** Contact Binghost support for specific cPanel/Console configurations if you aren't using a raw VPS.
