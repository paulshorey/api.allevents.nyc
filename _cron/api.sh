# attempt to renew SSL before messing with port :80
# /opt/letsencrypt/letsencrypt-auto renew
# /etc/init.d/nginx reload


# start app
# iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 1080

# eval "$(ssh-agent -s)"
# ssh-add ~/.ssh/ps1-git
# cd /www/api-nyc
# git reset HEAD -\-hard;
# git pull

# node api.js