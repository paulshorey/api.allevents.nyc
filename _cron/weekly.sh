# sudo /opt/letsencrypt/letsencrypt-auto certonly -a webroot --webroot-path=/usr/share/nginx/html -d api.allevents.nyc

# /opt/letsencrypt/letsencrypt-auto renew >> /var/log/le-renew.log
# /etc/init.d/nginx reload




# vim /etc/nginx/sites-available/default

# server {
#   listen 80;
#   server_name localhost;
#   return 301 https://$host$request_uri;
# }
# server {
#   listen 443 ssl;
#   server_name localhost;

#   ssl_certificate /etc/letsencrypt/live/api.allevents.nyc/fullchain.pem;
#   ssl_certificate_key /etc/letsencrypt/live/api.allevents.nyc/privkey.pem;

#   root /usr/share/nginx/html;
#   index index.html index.htm index.nginx-debian.html;

#   location / {
#     try_files $uri $uri/ =404;
#   }

#   location ^~ /.well-known/ {
#     allow all;
#   }
# }