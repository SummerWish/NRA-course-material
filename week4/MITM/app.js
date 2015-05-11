var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser());

app.all('*', function (req, res) {
  var h = req.headers;
  h.host = 'tjis2.tongji.edu.cn';

  request[req.method]({
    url: 'http://192.168.30.1:58080' + req.url,
    encoding: null,
    form: req.body,
    headers: h,
  }, function (err, response, body) {
    res.status(response.statusCode);
    var head;
    for (head in response.headers) {
      res.setHeader(head, response.headers[head]);
    }
    res.send(body);
  });
});

app.listen(58080);