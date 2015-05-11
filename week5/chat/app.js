var express = require('express');
var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(1234);
app.use(express.static('public'));

var clients = [];

// 返回当前所有具有名字的客户端的名字
function getAllNames() {
  var ret = [];
  clients.forEach(function (socket) {
    if (socket._name) {
      ret.push(socket._name);
    }
  });
  return ret;
}

function onListChanged() {
  // 告诉客户端新的列表
  io.emit('listchanged', getAllNames());
}

io.on('connection', function (socket) {
  socket._name = null;

  // 有新客户端请求时，将这个客户端加入 clients[] 数组
  clients.push(socket);

  // 客户端向服务器发送 changename 消息，服务器为该客户端指定一个名字
  socket.on('changename', function (name) {
    socket._name = name;
    onListChanged();  // 并告诉所有人名字已改变
  });

  // 断开连接时，将自己从 clients[] 数组中删除掉
  socket.on('disconnect', function () {
    var i;
    for (i = 0; i < clients.length; ++i) {
      if (clients[i] === socket) {
        clients.splice(i, 1);
        break;
      }
    }
    onListChanged();
  });

  // 客户端向服务器发送 comment 消息，服务器广播评论
  socket.on('comment', function (comment) {
    if (socket._name) {
      // 生成日期
      var date = new Date();
      var dateStr = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
      // 广播消息
      io.emit('comment', '[' + dateStr + '] ' + socket._name + ': ' + comment);
    }
  });
});
