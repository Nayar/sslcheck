var express = require('express');
var app = express();
var http = require("http");
var fs = require('fs');

var request = require('request');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true }));
app.use(bodyParser.json());
const exec = require('child_process').exec;

var domains = []

fs.readFile('domains.json', 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    domains = JSON.parse(data)
    
    refresh_all_domains()
    setInterval(function(){
        refresh_all_domains()
    }, 1000 * 60* 60);
    
    
});

var log = function(data, level) {
    console.log(data);
    exec("echo '" + JSON.stringify(data) + "' | systemd-cat -p 6 -t sslcheck")
}

app.get('/', function(req, res) {
    res.render('index.pug');
});

app.get('/api/domains', function(req, res) {
    res.send(domains)
});

function refresh_all_domains() { 
    for(var i = 0; i < domains.length; i++){
        refresh_domain(i);
    }
}

function check_domain(domain,callback) {
    
    cmd = 'echo | openssl s_client -connect ' + domain + ':443 -servername ' + domain + ' 2>/dev/null | openssl x509 -noout -enddate'
    //     console.log(cmd)
    openssl = exec(cmd);
    
    openssl.stdout.on('data', function(data) {
        //         console.log(data)
        data = data.trim()
        date = data.split('=');
        date = new Date(date[1])
        res_domain = {
            expiry : date,
            domain : domain,
            days_rem : (date - Date.now()) / 1000 / 60 / 60 / 24
        }
        
        callback(res_domain);
    }); 
    
    openssl.stderr.on('data', function(data) {
        console.log('' + data);
        callback('')
    }); 
    
    openssl.on('close', function (code) {
        //     console.log('child process exited with code ' + code);
    });
}

function refresh_domain(i) {
    domain = domains[i]
    check_domain(domain.domain,function(data) {
        domains[i] = data
        fs.writeFile("domains.json", JSON.stringify(domains), function(err) {
            if(err) {
                return console.log(err);
            }
            log(domains[i])
        });
    });
}

app.post('/api/domains/refresh', function(req,res) {
    for(var i = 0; i < domains.length; i++){
        refresh_domain(i);
    }
    res.send('ok')
});

app.get('/api/domains/_search', function(req, res) {
    domain = req.query.domain
    check_domain(domain,function(data) {
        domains.push(data)
        res.send(data)
        data.days_rem = (data.expiry - Date.now()) / 1000 / 60 / 60 / 24
        log(data)
    })
});


app.listen(3000, function () {
    console.log('NodeJS listening on port 3000!');
});