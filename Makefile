install:
	mkdir -p /opt/sslcheck
	cp -r ./dashboard/* /opt/sslcheck/
	cp ./sslcheck.service /etc/systemd/system/
	
