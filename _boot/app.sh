iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 1080

cd /www/api-nyc

i=0;
while true; do
	i=$[$i+1]
	echo node api.js \#$i starting...
	node api.js --iteration=$i
	sleep 60
done