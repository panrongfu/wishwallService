var mysql = require('mysql');
var rongcloudSDK = require('../rongCloud');
var moment = require('moment');
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

//用户注册
exports.userRegister = function(user) {
  var userId = user.userId;
  var userName = user.userName;
  var password = user.password;
  var sql = 'INSERT INTO user VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
  var values = [userId, userName, password,'','','','','','','','','','','','',userName];
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

//第三方登录的用户系统默认注册账号
exports.defaultRegister = function(user) {
  var userId = user.userId;
  var userName = user.userName;
  var userIcon = user.userIcon;
  var userSex = user.userSex;
  var password = user.password;
  var sql = 'INSERT INTO user VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
  //默认的昵称是用户账户
  var values = [userId, userName, password,'',userIcon,userSex,'','','','','','','','','',userName];
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
//设置新密码
exports.setNewPassword = function(password,account) {
  var sql = 'UPDATE user SET password=? WHERE username=?';
  var values = [password,account];
  sql = mysql.format(sql, values);
  console.log(sql+"》》》》》》》》》》");

  //创建promise
  var promise = new Promise(function(resolve, reject) {
    connection.query(sql, function(err,result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
  return promise;
}

//用户登录
exports.userLogin = function(user){
  var username = user.username;
  var password = user.password;
  var sql = 'SELECT *FROM user WHERE username=? AND password=?'
  var values = [username,password];
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
//更新用户数据
exports.updateUserInfo = function(userInfo) {

  var userId = userInfo.userId;
  var nickName = userInfo.nickName;
  var icon = userInfo.icon;
  var sex = userInfo.sex;
  var phone = userInfo.phone;
  var year = userInfo.year;
  var month = userInfo.month;
  var day = userInfo.day;
  var prov = userInfo.prov;
  var city = userInfo.city;
  var area = userInfo.area;
  var wx = userInfo.wx;
  var qq = userInfo.qq;

  var sql = 'UPDATE user SET nickname=?,icon=?,sex=?,phone=?,birth_year=?,birth_month=?,birth_day=?,province=?,city=?,area=?,weixin=?,qq=? WHERE userid=?';
  var values = [nickName, icon, sex, phone, year, month, day, prov, city, area, wx, qq,userId];
  sql = mysql.format(sql, values);
  console.log(sql);
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

//获取用户Token
exports.getToken = function(user) {
  var userId = user.userId;
  var userName = user.userName;
  // var icon = user.icon;
  //创建promise
  var promise = new Promise(function(resolve, reject) {
    rongcloudSDK.user.getToken(userId, userName, 'http://files.domain.com/avatar.jpg', function(err, resultText) {
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

//为用户添加token
exports.insertToken = function(token, userId) {
  try {
    var sql = 'UPDATE user SET token=? WHERE userid =?';
    var values = [token, userId];
    sql = mysql.format(sql, values);
    console.log("sql>>>>>>>>>>>>>>>>>>"+sql);
    //创建promise
    var promise = new Promise(function(resolve, reject) {
        connection.query(sql, function(err, result) {
        if (err) {
          console.log(JSON.stringify(err));
          reject(err);

        } else {
          console.log(JSON.stringify(result));
          resolve(result);
        }
      });
    });
    return promise;
  } catch (e) {
    console.log(e);
  }
}

//根据用户名查询用模糊查询
exports.findUsersLikeName = function(nickname) {
  var sql = 'SELECT *FROM user WHERE nickname LIKE ?';
  var values = '%'+nickname+'%';
  sql = mysql.format(sql, values);
  console.log("-------------------------");
  console.log(sql);
  console.log("--------------------");
  //创建promise
  var promise = new Promise(function(resolve, reject) {
      connection.query(sql, function(err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
  return promise;
}

//根据用户名查询用
exports.findUserByName = function(username) {
  var sql = 'SELECT *FROM user WHERE username =?';
  var values = username;
  sql = mysql.format(sql, values);
  //创建promise
  var promise = new Promise(function(resolve, reject) {
      connection.query(sql, function(err, rows, fields) {
      if (err) {
        reject(err);
        console.log("err"+err);
      } else {
        console.log("rows>>>>"+rows);
        resolve(rows[0]);
      }
    });
  });
  return promise;
}

//申请添加好友
exports.applyAddFriend = function(userid, friendid) {
  var sql = 'INSERT INTO apply_friend VALUES(?,?,?,?)';
   var time = moment().format('YYYY-MM-DD HH:mm:ss');
  // var time = new Date().getTime();
  //3表示请求添加
  var values = [userid, friendid, time, 3];
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

//添加好友
exports.addFriend = function(userid, friendid) {
  var sql = 'INSERT INTO friends VALUES(?,?,?,?)';
   var time = moment().format('YYYY-MM-DD HH:mm:ss');
  //这里satus为3表示请求添加为好友
  var values = [userid, friendid,1,time];
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
exports.updateApplyFriend = function(userid,friendid,status){
  var sql = 'UPDATE apply_friend SET status=? WHERE userid=? AND friendid=?';
  var values = [status, userid, friendid];
  sql = mysql.format(sql, values);
  console.log(sql);
  //创建promise
  var promise = new Promise(function(resolve, reject) {
    connection.query(sql, function(err, result) {
      if (err) {
        console.log(err+"<>><><><>");
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
  return promise;
}

//更新用户与添加者的关系 status 
exports.updateFriend = function(userid, friendid, status) {

  var sql = 'UPDATE relation SET status =? WHERE userid=? AND friendid=?';
  var values = [status, userid, friendid];
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

//查询好友列表id
exports.findFriendIds = function(userId) {
 // var sql = 'SELECT relation.friendid FROM relation where userid=? OR friendid=?';
  //status 为1表示已经是好友关系
  var sql = 'SELECT f.friendid FROM friends f where userid=?';
  sql = mysql.format(sql, userId);
  console.log(sql+">>>>>>>"+userId);
  //创建promise
  var promise = new Promise(function(resolve, reject) {
    connection.query(sql, function(err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
  return promise;
}

//根据用户ID查询用户
exports.findUserById = function(userid) {
  var sql = 'SELECT * FROM `user` WHERE userid=?';
  var values = [userid];
  sql = mysql.format(sql, values);
  //创建promise
  var promise = new Promise(function(resolve, reject) {
    connection.query(sql, function(err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows[0]);
      }
    });
  });
  return promise;
}

//根据该用户Id查询该用户的好友列表
exports.findFriendList = function(userid) {
  var sql = 'SELECT * FROM friends f INNER JOIN user u ON f.friendid=u.userid WHERE f.userid=?';
 // var sql ='SELECT * FROM friends f INNER JOIN user u ON f.friendid=u.userid WHERE (f.userid=? OR f.friendid=?)';
  var values = [userid,userid];
  sql = mysql.format(sql, values);
  //创建promise
  var promise = new Promise(function(resolve, reject) {
    connection.query(sql, function(err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
  return promise;
}
//（这里区别于findFriendList ）查询添加好友的状态列表（已添加，未添加，拒绝等状态） 不是指好友列表
exports.applyAddFriendList = function(userid){
  var sql = 'SELECT u.*,af.status FROM apply_friend af INNER JOIN user u ON af.userid=u.userid  WHERE af.friendid=?';
  var values = [userid];
  sql =mysql.format(sql,values);

  //创建promise
    var promise = new Promise(function(resolve, reject) {
    connection.query(sql, function(err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
  return promise;
}

//查询用户所有的群
exports.findAllGroups = function(){
  var sql ='SELECT * FROM groups';
    //创建promise
  var promise = new Promise(function(resolve, reject) {
    connection.query(sql, function(err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
  return promise;
}

//查询用户所参加的群id
exports.findMyGroups = function(userId){
  var sql = 'SELECT g.*FROM user_group As ug INNER JOIN groups AS g ON ug.groupid = g.groupid WHERE ug.userid=?';
  var values = [userId];
  sql =mysql.format(sql,values);
  console.log("------------------------------");
  console.log(sql);
  //创建promise
  var promise = new Promise(function(resolve, reject) {
    connection.query(sql, function(err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
  return promise;
}

//查询指定的群组的信息
exports.findGroupInfoById = function(groupId){

  var sql = 'SELECT * FROM groups WHERE groupid=?';
  var values = [groupId];
  sql = mysql.format(sql, values);
  //创建promise
  var promise = new Promise(function(resolve, reject) {
    connection.query(sql, function(err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows[0]);
      }
    });
  });
  return promise;
}
//根据名称查询群组
exports.findGroupByName = function(name){
  var sql = 'SELECT * FROM groups WHERE `name`LIKE ?';
  var value='%'+name+'%';
  sql = mysql.format(sql,value);

  //创建promise
  var promise = new Promise(function(resolve,reject){
     connection.query(sql, function(err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
  return promise;
}

//查询所有的聊天室
exports.findAllChatrooms = function(){
  var sql = 'SELECT * FROM chatroom';
  //创建promise
  var promise = new Promise(function(resolve,reject){
    connection.query(sql,function(err,rows,fields){
      if(err){
        reject(err);
      }else{
        resolve(rows);
      }
    });
  });
  return promise;
}

//查询指定Id的用户信息(可以多个id)
exports.findUsersByIds = function(ids){
  console.log(ids+">>>>>>>>>>>>");
    var strs= new Array();
    strs = ids.split(',');
    var sql = 'SELECT * FROM user WHERE userid IN('
    for(var i = 0; i<strs.length; i++){
        sql +='?';
        if(i !== strs.length-1){
          sql +=',';
        }else{
           sql+=')'
        }
    }
    sql = mysql.format(sql,strs);
    //创建promise
    var promise = new Promise(function(resolve,reject){
      connection.query(sql,function(err,rows,fields){
      if(err){
        reject(err);
      }else{
        resolve(rows);
      }
    });
  });
  return promise;
}


//////////////////
//省市区三级联动//
//////////////////

//查询所有的省
exports.findAllProv = function(){
    var sql = 'SELECT *FROM tb_prov_city_area_street WHERE level=1';
    var promise = new Promise(function(resolve,reject){
      connection.query(sql,function(err,rows,fields){
      if(err){
        reject(err);
      }else{
        resolve(rows);
      }
    });
  }); 
    return promise;
}

//查询省下的市
exports.findProvCity = function(code){
    var sql = 'SELECT *FROM tb_prov_city_area_street WHERE level=2 AND parentId=?';
    var values = [code];
    sql = mysql.format(sql,values);
    var promise = new Promise(function(resolve,reject){
      connection.query(sql,function(err,rows,fields){
      if(err){
        reject(err);
      }else{
        resolve(rows);
      }
    });
  }); 
    return promise;
}

//查询市下的区、县
exports.findCityArea = function(code){
    var sql = 'SELECT *FROM tb_prov_city_area_street WHERE level=3 AND parentId=?';
    var values = [code];
    sql = mysql.format(sql,values);
    var promise = new Promise(function(resolve,reject){
      connection.query(sql,function(err,rows,fields){
      if(err){
        reject(err);
      }else{
        resolve(rows);
      }
    });
  }); 
    return promise;
}
//查询所有的市
exports.getAllCity = function(){
    var sql = 'SELECT *FROM tb_prov_city_area_street WHERE level=2';
    var promise = new Promise(function(resolve,reject){
      connection.query(sql,function(err,rows,fields){
      if(err){
        reject(err);
      }else{
        resolve(rows);
      }
    });
  }); 
  return promise;
}
exports.findCityByCode = function(level,code){

    var sql = 'SELECT pca.name FROM tb_prov_city_area_street pca WHERE level=? AND code=?';
    var values = [level,code];
    sql = mysql.format(sql,values);  
    var promise = new Promise(function(resolve,reject){
      connection.query(sql,function(err,rows,fields){
      if(err){
        reject(err);
      }else{
        resolve(rows[0]);
      }
    });
  }); 
  return promise;

}

//根据城市名称查询对应code
exports.findCodeByName = function(name){
  var sql = 'SELECT * FROM tb_prov_city_area_street WHERE level=2 AND name=?';
    var values = [name];
    sql = mysql.format(sql,values);
    var promise = new Promise(function(resolve,reject){
      connection.query(sql,function(err,rows,fields){
      if(err){
        reject(err);
      }else{
        resolve(rows[0]);
      }
    });
  }); 
    return promise;
}

//创建许愿条
exports.createWish = function(wishId,userId,content,cityName){
  var sql = 'INSERT INTO wishs VALUES(?,?,?,?,?)';
 // var time = 'NOW()';
 //var time = new Date().getTime();
 var time = moment().format('YYYY-MM-DD HH:mm:ss');
 console.log(time+"<><><><><><><><><><><><>");
  //3表示请求添加
  var values = [wishId, userId, content, cityName,time];
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

//为许愿条添加图片
exports.addWishImage = function(wishId, imgUrl) {
  var sql = 'INSERT INTO wish_imgs VALUES(?,?)';
  //3表示请求添加
  var values = [wishId, imgUrl];
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

//个人中心背景图片
exports.addMyCenterPic = function(picId,userId,picUrl){
  var sql = 'INSERT INTO center_pics VALUES(?,?,?,?)';
  var time = moment().format('YYYY-MM-DD HH:mm:ss');
  var values = [picId, userId,picUrl,time];
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
//查询个人中心的背景图片
exports.findMyCenterPic = function(userId){
  var sql = 'SELECT cp.pic_url FROM center_pics cp WHERE userid=?';
  var value = userId;
  sql = mysql.format(sql,value);
  console.log("......................");
  console.log(sql);
    var promise = new Promise(function(resolve, reject) {
    connection.query(sql, function(err,rows,fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows[0]);
      }
    });
  });
  return promise;
}

//查询我的许愿条
exports.findMyWish = function(userId,page){
  var cpage = page;
  var pageSize = 10;
  var startIndex = (cpage-1)*pageSize;
  var sql = 'SELECT u.username,u.nickname,u.userid,u.icon,w.content,w.time,w.wishid FROM user u INNER JOIN wishs w ON u.userid=w.userid WHERE u.userid=? ORDER BY w.time DESC limit ?,?';
  var values = [userId,startIndex,pageSize];

  sql = mysql.format(sql,values);
  console.log(sql);
  var promise = new Promise(function(resolve,reject){
         connection.query(sql,function(err,rows,fields){
      if(err){
        reject(err);
      }else{
        resolve(rows);
      }
    });
  });
  return promise;
}

//查询许愿条的图片
exports.findWishImage = function(wishId) {
  var sql = 'SELECT wi.imageid FROM wish_imgs wi WHERE wishid=?';
  sql = mysql.format(sql, wishId);
  var promise = new Promise(function(resolve, reject) {
    connection.query(sql, function(err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
  return promise;
}

//根据城市查询许愿条
exports.findWishByCity = function(page,cityName){

  var cpage = page;
  var pageSize = 10;
  console.log(`cityNmae:${cityName}`);
  var startIndex = (cpage-1)*pageSize;
  //String sql = "select * from deployees from departmentid='1001' limit "+startIndex+","+pageSize;
  var sql = 'SELECT u.username,u.nickname,u.userid,u.icon,w.content,w.time,w.wishid FROM user u INNER JOIN wishs w ON u.userid=w.userid WHERE w.city LIKE ? ORDER BY w.time DESC limit ?,?';
  var values = ['%'+cityName+'%',startIndex,pageSize];
  sql = mysql.format(sql,values);
  console.log(sql);
  var promise = new Promise(function(resolve,reject){
         connection.query(sql,function(err,rows,fields){
      if(err){
        reject(err);
      }else{
        resolve(rows);
      }
    });
  });
  return promise;
}
//根据名称查询许愿条
exports.findWishByName = function(page,name){
  var cpage = page;
  var pageSize = 10;
  var startIndex = (cpage-1)*pageSize;
  //String sql = "select * from deployees from departmentid='1001' limit "+startIndex+","+pageSize;
  var sql = 'SELECT u.username,u.nickname,u.userid,u.icon,w.content,w.time,w.wishid FROM user u INNER JOIN wishs w ON u.userid=w.userid WHERE w.content LIKE ? limit ?,?';
  var sName= '%'+name+'%';
  var values = [sName,startIndex,pageSize];
  sql = mysql.format(sql,values);
  console.log(sql);
  var promise = new Promise(function(resolve,reject){
         connection.query(sql,function(err,rows,fields){
      if(err){
        reject(err);
      }else{
        resolve(rows);
      }
    });
  });
  return promise;
}

//用户意见反馈
exports.addUserAdvise = function(adviseId,userId,advise){
  var sql = 'INSERT INTO advise VALUES(?,?,?,?)';
  var time = moment().format('YYYY-MM-DD HH:mm:ss');
  var values = [adviseId,userId, advise,time];
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
//点赞
exports.likeWish = function(likeId,wishId,userId){
  var sql = 'INSERT INTO likes VALUES(?,?,?,?)';
  var time = moment().format('YYYY-MM-D HH:mm:ss');
  var values = [likeId,wishId,userId,time];
  sql = mysql.format(sql, values);
  console.log(sql+">>>>>>>>>>>>>>");
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

exports.unLikeWish = function(likeId,userId){
  var sql = 'DELETE FROM likes WHERE likeid=? AND userid=?';
  var values = [likeId,userId];
  sql = mysql.format(sql, values);
  console.log(sql+">>>unLikeWish>>>>>>>>>");
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
//查询许愿条所有的赞
exports.findWishLike = function(wishId){
  var sql ='SELECT l.likeid,u.userid,u.username,u.nickname FROM likes l INNER JOIN user u ON l.userid=u.userid WHERE wishid=?';
  sql = mysql.format(sql, wishId);
  var promise = new Promise(function(resolve, reject) {
    connection.query(sql, function(err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
  return promise;
}

//查询许愿条所有的赞
exports.findWishComm = function(wishId){
  var sql ='SELECT u.userid,u.username,u.nickname,u.icon,c.content FROM comments c INNER JOIN user u ON c.userid=u.userid WHERE wishid=?';
  sql = mysql.format(sql, wishId);
  console.log("findComm:"+sql);
  var promise = new Promise(function(resolve, reject) {
    connection.query(sql, function(err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
  return promise;
}
//评论
exports.commWish = function(commId,wishId,userId,commText){

  var sql = 'INSERT INTO comments VALUES(?,?,?,?,?)';
  var time = moment().format('YYYY-MM-DD HH:mm:ss');
  var values = [commId,wishId,userId,commText,time];
  sql = mysql.format(sql, values);
  console.log(sql+">>>>>>>>>>>>>>");
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

