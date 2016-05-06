var mysql = require('mysql');
var rongSDK = require('../../rongCloud');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'pan',
  database: 'wishwall'
});

//后台管理员登录
exports.adminLogin = function(admin){

  var adminname = admin.adminname;
  var password = admin.password;

  var sql = 'SELECT * FROM admin WHERE adminname=? AND password=?';
  var values = [adminname,password];
  sql = mysql.format(sql, values);
  //创建promise
  var promise = new Promise(function(resolve,reject){  
      connection.query(sql, function(err, rows, fields) {
       if(err){
        reject(err);
       }else{
        resolve(rows[0]);
       }
      });   
  });
 return promise;
}

//向融云服务器发送创建聊天室请求
exports.sendCreateChatroom = function(room_id, room_name) {
    var chatroomIdNamePairsArray = [];
    chatroomIdNamePairsArray.push({id: room_id,name: room_name});
  // _.each( chatroomIDs, function( chatroomId ) {
  //   chatroomIdNamePairsArray.push( { id : chatroomId, name : testConfig.chatroom.chatroomIdNamePairs[ chatroomId ] } );
  // });
  var promise = new Promise(function(resolve, reject) {
    rongSDK.chatroom.create(chatroomIdNamePairsArray, function(err, resultText) {
      if(err){
          reject(err);
      }else{
         var result = JSON.parse(resultText);
         resolve(result)
      }
    });
  });
  return promise;
}
//向数据库chatroom表插入数据
exports.createChatroom = function(room_id,userid,room_name){
  var sql = 'INSERT INTO chatroom VALUES(?,?,?,?)';
  var time = moment().format('YYYY-MM-DD hh:mm:ss');
  var values = [room_id, userid, room_name,time];
  sql = mysql.format(sql, values);
  console.log(sql);
  //创建promise
  var promise = new Promise(function(resolve, reject) {
    connection.query(sql, function(err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
  return promise;
}