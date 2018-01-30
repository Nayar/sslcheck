#!/bin/bash
declare -a domains=()
function check {
    domain=$1
    now=$(date +%s)
    expiry_date=`echo | openssl s_client -connect $domain:443 -servername $domain 2>/dev/null | openssl x509 -noout -enddate | sed 's/notAfter=\(.*\)/\1/'`
    expiry_date=$(date --date "$expiry_date" +%s) 
    days_rem=$(($expiry_date - $now))
    echo $(($days_rem/60/60/24))
}
for domain in "${domains[@]}"; do
        
        days_rem=$(check $domain)
        echo "{\"domain\": \"$domain\", \"days_rem\": $days_rem}"
done