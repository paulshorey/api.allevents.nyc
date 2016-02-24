cd /www/$(hostname)
git pull
npm install
i=1;
while true; do
	node api.js --iteration=$i
	sleep 60
	((i++))
done