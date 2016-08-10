# R&D
## Finding expiry date using CLI ^[http://www.shellhacks.com/en/HowTo-Check-SSL-Certificate-Expiration-Date-from-the-Linux-Shell]

```
$ echo | openssl s_client -connect rh.stellatelecom.com:443 -servername rh.stellatelecom.com 2>/dev/null | openssl x509 -noout -dates

```

# Design
## 