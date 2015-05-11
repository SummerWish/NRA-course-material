var request = require('request');
var request = request.defaults({jar: true});
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var _ = require('underscore');
var async = require('async');

// 修改以下四项，用于你自己的房间
var campusId = '5';
var buildingId = '3001';
var floorId = '3008';
var roomId = '417';

var viewState;
var viewStateGenerator;

function sendRequest(method, parameters, callback) {
  request[method]({
    url: 'http://202.120.165.79:8801/Default.aspx',
    encoding: null,
    form: _.extend({
      __EVENTARGUMENT: '',
      __LASTFOCUS: '',
      __VIEWSTATE: viewState,
      __VIEWSTATEGENERATOR: viewStateGenerator,
    }, parameters)
  }, function (err, res, body) {
    body = iconv.decode(body, 'gb2312');

    var $ = cheerio.load(body);
    viewState = $('#__VIEWSTATE').val();
    viewStateGenerator = $('#__VIEWSTATEGENERATOR').val();

    callback();
  });
}

function send(method, parameters) {
  return function (callback) {
    sendRequest(method, parameters, callback);
  };
}

async.series([
  send('get', {}),
  send('post', {
    __EVENTTARGET: 'drlouming',
    drlouming: campusId,
    drceng: '',
    DropDownList1: '',
    txt_fangjian: ''
  }),
  send('post', {
    __EVENTTARGET: 'drceng',
    drlouming: campusId,
    drceng: buildingId,
    DropDownList1: '',
    txt_fangjian: ''
  }),
  send('post', {
    __EVENTTARGET: 'DropDownList1',
    drlouming: campusId,
    drceng: buildingId,
    DropDownList1: floorId,
    txt_fangjian: ''
  }),
  send('post', {
    __EVENTTARGET: '',
    drlouming: campusId,
    drceng: buildingId,
    DropDownList1: floorId,
    txt_fangjian: roomId,
    radio: 'buyR',
    'ImageButton1.x': '0',
    'ImageButton1.y': '0'
  }),
  function (callback) {
    request.get({
      url: 'http://202.120.165.79:8801/buyRecord.aspx',
    }, function (err, res, body) {
      var $ = cheerio.load(body);
      var balance = parseFloat($('.number').text());
      console.log('Balance: %d', balance);
      callback();
    });
  }
]);