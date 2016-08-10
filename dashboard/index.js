var express = require('express');
var app = express();
var http = require("http");

var request = require('request');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true }));
app.use(bodyParser.json());
const exec = require('child_process').exec;

var domains = []

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
    res.render('index.pug');
});

app.get('/api/domain', function(req, res) {
    
});

app.get('/api/domain/_search', function(req, res) {
//     console.log(req)
    
    domain = req.query.domain
    
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
            expiry_rem_days : (date - Date.now())/1000/60/60/24
        }
        res.send(res_domain);
    }); 
    
    openssl.stderr.on('data', function(data) {
        console.log('' + data);
        res.send('')
    }); 
    
    openssl.on('close', function (code) {
        //     console.log('child process exited with code ' + code);
    });
});


app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});