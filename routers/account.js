var router = require('koa-router')();
var uuid = require('node-uuid');
var jwt = require('koa-jwt');
var userService = require('../service/userService');
var adminService = require('../service/admin/adminService');
var pushService = require('../service/pushService');

/////////////////
var STS = require('ali-oss').STS;
var co = require('co');
var fs = require('fs');
var fs = require('fs');
var xml2js = require('xml2js');

////////////

//用户注册
router.post('/user/register', function*(next) {
  var ps = this.request.body;
  var userName = ps.userName;
  var password = ps.password;
  //先进行验证该用户名是否注册
  var hasSign = yield userService.findUserByName(userName);
  //如果查询结果为空，即可用该用户未注册，若不为空则该用户已经注册
  if(hasSign === undefined){
     //基于时间戳生成uuid
    var userId = uuid.v1();
    var user = {
      'userId': userId,
      'userName': userName,
      'password': password
    };
    var affect = yield userService.userRegister(user);
    if(affect.affectedRows === 1){
      //向融云发送获取Token的请求饭200结果码表示成功
      var rong = yield userService.getToken(user);
         console.log(JSON.stringify(rong));
      if(rong.code === 200){
        //向数据库插入token
        var inToken = yield userService.insertToken(rong.token, userId);
        console.log("inToken"+JSON.stringify(inToken));
        if(inToken.affectedRows === 1){
          this.body = this.RESS(200,'success');
          return;
        }else{
          throw new Error("数据库异常");
        }
      }else{
        throw new Error("服务器异常"); 
      } 
    }else{
      throw new Error("注册失败"); 
    }
     return; 
  }
 throw new Error("该用户名已存在");
});

router.post('/defaultRegister',function*(next){
  var ps = this.request.body;
  var userId = ps.userId;
  var userName = ps.userName;
  var userIcon = ps.userIcon;
  var userSex = ps.userSex;
  //默认密码
  var password = '123456';
  //先进行验证该用户名是否注册
  var hasSign = yield userService.findUserByName(userName);
  //如果查询结果为空，即可用该用户未注册，若不为空则该用户已经注册
  if(hasSign === undefined){
     //基于时间戳生成uuid
    var userId = uuid.v1();
    var user = {
      userId: userId,
      userName: userName,
      userIcon:userIcon,
      userSex:userSex,
      password: password
    };
    var affect = yield userService.defaultRegister(user);
    if(affect.affectedRows === 1){
      //向融云发送获取Token的请求饭200结果码表示成功
      var rong = yield userService.getToken(user);
         console.log(JSON.stringify(rong));
      if(rong.code === 200){
        //向数据库插入token
        var inToken = yield userService.insertToken(rong.token, userId);
        console.log("inToken"+JSON.stringify(inToken));
        if(inToken.affectedRows === 1){
          this.body = this.RESS(200,'success');
          return;
        }else{
          throw new Error("数据库异常");
        }
      }else{
        throw new Error("服务器异常"); 
      } 
    }else{
      throw new Error("注册失败"); 
    }
     return; 
  }
 throw new Error("该用户名已存在");

});

//设置新密码
router.post('/setNewPassword',function*(next){
  try{
    var ps = this.request.body;
   // var userId = this.state.user.userId;
    var account = ps.account;
    var pwd = ps.password;

    var affect = yield userService.setNewPassword(pwd,account);
    if(affect.affectedRows === 1){
      this.body = this.RESS(200,'success');
      return;
    }

  }catch(e){
    throw new Error(e.message);
  }
});

//用户登录
router.post('/user/login', function*(next) {
  var parameters = this.request.body;
  var username = parameters.username;
  var password = parameters.password; 
  var user = {
    'username': username,
    'password': password
  };
  console.log(username +":::"+password);
  var result;
  var rows = yield userService.userLogin(user);
  if(rows!=null){ 
    var userId = rows.userid;
    //生成token
    var wToken = jwt.sign({userId:userId},"wishwall-secret",{expiresIn:'48h'});
    rows.wToken = wToken;  
    this.body = this.RESS(200,rows);
    return;
  }
   throw new Error("用户名或密码错误");
});

//管理员登录
router.post('/admin/login',function*(next){
  var ps = this.request.body;
  var adminname = ps.adminname;
  var password = ps.password;
  console.log('adminnamme>>>>'+adminname);
  console.log("password>>>>>>>"+password);
  var admin = {
    'adminname': adminname,
    'password': password
  };
  var rows = yield adminService.adminLogin(admin);
  console.log("admin login result>>>>"+JSON.stringify(rows));
  if(rows!=null){
    var id = rows.id;
    var wToken = jwt.sign({id:id},"wishwall-secret",{expiresIn:'2h'});
    rows.wToken = wToken;
    
    this.body = this.RESS(200,rows);
    return;
  }
  throw new Error("用户名或密码错误");
});



////////////////////////////////////////
router.get('/findUserById',function*(next){
  try{
    //var parameters = this.request.body;
   // var userid = parameters.userid;
  
    var rows = yield userService.findUserById('5a5b7960-0065-11e6-9ea7-27ec933c934a');
    console.log(rows);
    var provCode = rows.province;
    var cityCode = rows.city;
    var areaCode = rows.area; 
    var provName = yield userService.findCityByCode(1,provCode);
    var cityName = yield userService.findCityByCode(2,cityCode);
    var areaName = yield userService.findCityByCode(3,areaCode);
    rows.province = provName.name;
    rows.city = cityName.name;
    rows.area = areaName.name;
    this.body = this.RESS(200,rows);
  }catch(e){
    throw new Error(e.message);
  }
});



//检查更新
router.get('/checkForUpdate', function*(next) {
  try{
    var parser = new xml2js.Parser(xml2js.defaults['0.1']);
    var showThis = this;
    fs.readFile('./updateApk/version.xml', function(err, data) {
    parser.parseString(data, function(err, result) {
        showThis.body = showThis.RESS(200,result);
        return;
      });
    });
  }catch(e){
    console.log(JSON.stringify(e));
    throw new Error(e.message);
  } 
});
module.exports = router;
