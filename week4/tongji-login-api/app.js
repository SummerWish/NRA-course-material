var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser());

// example usage page
app.get('/', function (req, res) {
  res.send('<form action="/login" method="POST"><input name="user"><input name="pass" type="password"><input type="submit"></form>');
});

app.post('/login', function (req, res) {
  request.post({
    url: 'http://tjis.tongji.edu.cn:58080/amserver/UI/Login',
    form: {
      'goto': 'http://x.com/ok',
      'gotoOnFail': 'http://x.com/fail',
      'Login.Token1': req.body.user,
      'Login.Token2': req.body.pass,
    }
  }, function (err, response, body) {
    if (response.headers.location.indexOf('fail') > -1) {
      res.send('Username or password error!');
    } else {
      res.send('Login succeeded!');
    }
  });
});

app.listen(8888);