install:
	mkdir -p /opt/sslcheck
	echo '{}' > /opt/sslcheck/domains.json
	cp -r ./dashboard/* /opt/sslcheck/
	cp ./sslcheck.service /etc/systemd/system/
	
