iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 1080

cd /www/api-nyc

mongod
node test.js

i=0;
while true; do
	i=$[$i+1]
	echo casperjs api.js \#$i starting...
	node api.js --iteration=$i
	sleep 60
done