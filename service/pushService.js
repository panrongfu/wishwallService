var rongSDK = require('../rongCloud');
var async       = require( 'async' );
var parseString = require( 'xml2js' ).parseString;
var optionalArgs = [ 'push content', 'push data' ];
var uuid = require('node-uuid');
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'pan',
  database: 'wishwall'
});
//创建一个连接
connection.connect(function (err){
   if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
});


/*
 *发送一个单聊信息包括：
 *发送用户id
 *接收用户id
 *消息内容
 *消息类型
 */
exports.sendMessage = function(fromUserId, toUserId, objectName,message) {
 
  var args = [fromUserId, toUserId, objectName, JSON.stringify(message)];
  var argsArray = [];
  argsArray.push(args.concat(optionalArgs.slice(0, 0), 'json'));
  var promise = new Promise(function(resolve, reject) {
    async.each(argsArray, function(_args, cb) {

      rongSDK.message.private.publish.apply(this, _args.concat(function(err, resultText) {
        console.log("err:" + resultText + "####" + "result:" + resultText);
         if (err) {
          reject(err);
           cb();
         } else {
        var result = JSON.parse(resultText);
        resolve(result);
         cb();
       }
      }));

    });
  });
return promise;
}

/*
 *向融云发送 创建一个群的请求,
 *userId：要加入群的用户 Id。（必传）
 *groupId：创建群组 Id。（必传）
 *groupName：群组 Id 对应的名称。（必传）
 */
exports.sendCreateGroup = function(userId, groupId, groupName) {
  var promise = new Promise(function(resolve, reject) {
    rongSDK.group.create(userId, groupId, groupName, function(err, resultText) {
      console.log("err:"+err+"####"+"result:"+resultText);
      if (err) {
        reject(err);
      } else {
        var result = JSON.parse(resultText);
        resolve(result);
      }
    });
  });
  return promise;
}

//向数据库groups表插数据
exports.createGroup = function(groupId, userId, groupName) {
  var sql = 'INSERT INTO groups VALUES(?,?,?,?,?,?,?,?,?,?,?,?)';
  var time = moment().format('YYYY-MM-DD hh:mm:ss');
  var values = [groupId, userId, groupName, "", "", "", "", "", 0, 500, time,0];
  sql = mysql.format(sql, values);

  console.log(sql+">>>");
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

/*
 *向融云发送 加入一个群的请求,
 *userId：要加入群的用户 Id。（必传）
 *groupId：创建群组 Id。（必传）
 */
exports.sendJoinGroup = function(userId,groupId,groupName){

  var promise = new Promise(function(resolve,reject){
      rongSDK.group.create(userId, groupId, groupName , function( err, resultText ) {    
        if(err){
          reject(err)
        }else{
          var result = JSON.parse( resultText );
          resolve(result);
        }   
      });
  });
  return promise;
}
//向数据库user_group表插入数据
exports.joinGroup = function(userId, groupId) {

  var sql = 'INSERT INTO user_group VALUES(?,?,?)';
  var join_time = new Date();
  var values = [groupId, userId, join_time];
  sql = mysql.format(sql, values);

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
//更新group信息
exports.updateGroup = function(number,groupId){
  var sql = 'UPDATE groups SET number=number+? WHERE groupid=?';
  var values = [number,groupId];
  var sql = mysql.format(sql,values);

  //创建promise
  var promise = new Promise(function(resolve,reject){
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
/*
 *向融云发送 退出一个群的请求,
 *userId：要加入群的用户 Id。（必传）
 *groupId：创建群组 Id。（必传）
 */
 exports.sendQuitGroup = function(userId, groupId) {
   var promise = new Promise(function(resolve, reject) {
     rongSDK.group.quit(userId, groupId, function(err, resultText) {
       if (err) {
         reject(err);
       } else {
         var result = JSON.parse(resultText);
         resolve(result);
       }
     });
   });
   return promise;
 }
 //数据库user_group表删除对应记录
exports.quitGroup = function(userId, groupId) {
  var sql = 'DELETE FROM user_group WHERE userid=?AND groupid=?'
  var values = [userId, groupId];
  sql = mysql.format(sql, values);

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

 

