iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 1080
cd /www/$(hostname)
i=1;
while true; do
	node api.js --iteration=$i
	sleep 60
	((i++))
done