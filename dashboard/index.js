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
    
    check_all_domains()
    setInterval(function(){
        check_all_domains()
    }, 1000 * 60* 60);
    
    
});

var log = function(data, level) {
    console.log(data);
    exec("echo '" + JSON.stringify(data) + "' | systemd-cat -p 6 -t sslcheck")
}

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
    res.render('index.pug');
});

app.get('/api/domains', function(req, res) {
    res.send(domains)
});

function check_all_domains() {
    for(var i = 0; i < domains.length; i++){
        domain = domains[i]
        domain.days_rem = (Date.parse(domain.expiry) - Date.now()) / 1000 / 60 / 60 / 24
        log(domain)
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
            domain : domain
        }
        fs.writeFile("domains.json", JSON.stringify(domains), function(err) {
            if(err) {
                return console.log(err);
            }
            
            console.log("The file was saved!");
        });
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

app.post('/api/domains/refresh', function(req,res) {
    for(var i = 0; i < domains.length; i++){
        check_domain(domains[i].name, function(data){
            domains[i] = data
        });
    }
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
    console.log('Example app listening on port 3000!');
});