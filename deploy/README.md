Deploy notes for controle-fin.ctdol.com.br

Steps to deploy on the server (run as root or via sudo):

1. Copy Nginx config:
   sudo cp deploy/nginx-controle-fin.conf /etc/nginx/sites-available/controle-fin
   sudo ln -s /etc/nginx/sites-available/controle-fin /etc/nginx/sites-enabled/

2. Create webroot for ACME challenge:
   sudo mkdir -p /var/www/html && sudo chown -R www-data:www-data /var/www/html

3. Reload Nginx to ensure config is valid:
   sudo nginx -t
   sudo systemctl reload nginx

4. Install Certbot and obtain TLS cert (Certbot will edit Nginx automatically if --nginx):
   sudo apt update && sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d controle-fin.ctdol.com.br -d www.controle-fin.ctdol.com.br

5. Install the systemd service for Uvicorn:
   sudo cp deploy/uvicorn-controle-fin.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now uvicorn-controle-fin.service

6. Ensure the backend virtualenv dependencies are installed and the database exists:
   cd /home/ctdolc07/controle-fin.ctdol.com.br/backend
   ./venv/bin/pip install -r requirements.txt

7. Check logs:
   sudo journalctl -u uvicorn-controle-fin -f
   sudo tail -n 200 /var/log/nginx/error.log

Notes:
- The Nginx config proxies to Uvicorn at 127.0.0.1:8000 and lets Nginx terminate TLS.
- Adjust `User`/`Group` in the systemd unit if you prefer a different system user.
- For production you may want to run Uvicorn behind Gunicorn + Uvicorn workers or use a process manager; this unit uses Uvicorn workers directly.
