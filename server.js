var exec = require('child_process').exec;
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var jsonParser = bodyParser.json();
var low = require('lowdb');
var storage = require('lowdb/file-sync');
var db = low('db.json', {
    storage: storage
});

var sendText = function(number, message) {
    setTimeout(function() {
        var cmd = 'curl -X POST http://textbelt.com/text -d "number=' + number + '" -d "message=' + message + '"';
        exec(cmd, function(error, stdout, stderr) {
            if (error) console.error(error);
            // if (stdout) console.log(stdout);
            // if (stderr) console.log(stderr);
        });
    }, 0);
};

var checkDb = function() {
    console.log("Checking db");
    db('alerts').forEach(function(alert) {
        if (alert !== undefined && alert.notifyDate < Date.now()) {
            console.log('sending message to: ' + alert.phone);
            sendText(alert.phone, "BANANALERT! Your banana is ready to be eaten!");
            db('alerts').remove(alert);
        }
    });
    console.log("Done checking db");
};

setInterval(checkDb, 10000);

app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/bananas', jsonParser, function(req, res) {
    var body = req.body;
    body.time = Date.now();
    db('alerts').push(body);
    res.send(JSON.stringify(req.body));
});

app.listen(80);
console.log('listening on port 80');