iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8100
# rm -rf /www/public/console/logs
# cd /www
# http-server public -p 8000 -s -c 30 #-d false