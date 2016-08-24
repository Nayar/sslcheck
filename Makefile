install:
	mkdir -p /opt/sslcheck
	cp ./dashboard/* /opt/sslcheck/
	cp ./sslcheck.service /etc/systemd/system/
