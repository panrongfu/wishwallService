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
    var userid = uuid.v1();
    var user = {
      'userid': userid,
      'username': username,
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
    var userid = uuid.v1();
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
    var wToken = jwt.sign({userId:userId},"wishwall-secret",{expiresIn:'2h'});
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


////////////////////////////////////////////////////
router.get('/findChatroom',function*(next){
    try{
      var rows = yield userService.findAllChatrooms();
      this.body = this.RESS(200,rows);
    }catch(e){
      throw new Error(e.message);
    }
});


//根据多个id查询多个用户信息
router.get('/findUsersByIds',function*(next){
    try{
      var ps = this.query;
      var ids = ps.ids;
      var rows = yield userService.findUsersByIds(ids);
      this.body = this.RESS(200,rows);
    }catch(e){
      throw new Error(e.message);
    }
});


//查询用户的好友列表
router.get('/findFriendList',function*(next){
    try{
       var parameter = this.query;
       var userid = parameter.userid;
       var rows = yield userService.findFriendList(userid);
       this.body = this.RESS(200,rows);
    }catch(e){
      throw new Error(e.message);
    }
});

// //查找用户加入群的所有Id
// router.get('/findMyGroups',function*(next){
//   try{
//     var ps = this.query;
//     var userId =ps.userid;
//     var rows = yield userService.findMyGroups(userId);
//     this.body = this.RESS(200,rows);
//   }catch(e){
//     throw new Error(e.message);
//   }
// });

router.get('/findGroupInfoById',function*(next){
  try{
    var ps = this.query;
    var groupId = ps.groupId;
    var rows = yield userService.findGroupInfoById(groupId);
    this.body = this.RESS(200,rows);
  }catch(e){
    throw new Error(e.message);
  }
});

//查询申请添加的用户列表（已添加，未添加，拒绝）
router.get('/applyAddFriendList',function*(next){
  try{
      var ps = this.query;     
       var userid = ps.userid;
       var rows = yield userService.applyAddFriendList(userid);
       this.body = this.RESS(200,rows);
       console.log(JSON.stringify(this.RESS(200,rows))+">>>>>>>>>>>>>");
  }catch(e){
    throw new Error(e.message);
  }
});

router.get('/getUploadToken', function*(next) {
  var conf = JSON.parse(fs.readFileSync('./config.json'));
  var policy;
  if (conf.PolicyFile) {
    policy = fs.readFileSync(conf.PolicyFile).toString('utf-8');
  }

  var client = new STS({
    accessKeyId: conf.AccessKeyId,
    accessKeySecret: conf.AccessKeySecret,
  });
  try{
    var result = yield client.assumeRole(conf.RoleArn, policy, conf.TokenExpireTime);
    var res={};
    res.AccessKeyId = result.credentials.AccessKeyId;
    res.AccessKeySecret = result.credentials.AccessKeySecret;
    res.SecurityToken = result.credentials.SecurityToken;
    res.Expiration = result.credentials.Expiration;

    this.body = this.RESS(200,res);
  }catch(e){
    throw new Error(e.message);
  }
});

//查询所有的省
router.get('/findAllProv',function*(next){
  try{
    var rows = yield userService.findAllProv();
    this.body = this.RESS(200,rows);
  }catch(e){
    throw new Error(e.message);
  }
}); 

// //查询省下的市
// router.get('/findProvCity',function*(next){
//   try{
//      var ps = this.query;
//     var code = ps.code;
//     var rows = yield userService.findProvCity(code);
//     this.body = this.RESS(200,rows);
//   }catch(e){
//     throw new Error(e.message);
//   }
// });
//查询市下的所有区、县
// router.get('/findCityArea',function*(next){
//     try{
//       var ps = this.query;
//       var code = ps.code;
//       var rows = yield userService.findCityArea(code);
//       this.body = this.RESS(200,rows);
//   }catch(e){
//     throw new Error(e.message);
//   }
// });

//查询城市的对应code值
router.get('/findCodeByName',function*(next){
  try{
     var ps = this.query;
     var name = ps.name;
     var rows = yield userService.findCodeByName(name);
     this.body = this.RESS(200,rows);
  }catch(e){
    throw new Error(e.message);
  }
});

// //查询所有城市
// router.get('/getAllCity',function*(next){
//   try{
//      var ps = this.query;
//      var rows = yield userService.getAllCity();
//      this.body = this.RESS(200,rows);
//   }catch(e){
//     throw new Error(e.message);
//   }
// });


//创建许愿条
router.get('/createWish',function*(next){
  try{
    var ps = this.query;
    var userId = ps.userId;
    var wishId = uuid.v1();
    var content = ps.content;
    var city = ps.city;

    var affect = yield userService.createWish(wishId,userId,content,city);
    if(affect.affectedRows === 1){
      this.body = this.RESS(200,wishId);
    }
  }catch(e){
    throw new Error(e.message);
  }
});


//查询我的许愿条
router.get('/findMyWish',function*(next){

    try{
      var ps = this.query;
     // var page  = ps.page;
      var userId = ps.userId;
     // var userId = this.state.user.userId;

      var wishs = yield userService.findMyWish(userId,1);
     if(wishs.length >= 1){
        for(var i = 0; i< wishs.length; i++){
              var imgs = yield userService.findWishImage(wishs[i].wishid);
              var likes = yield userService.findWishLike(wishs[i].wishid);
              var comms = yield userService.findWishComm(wishs[i].wishid);
              wishs[i].wish_img = imgs;
              wishs[i].wish_like = likes;
              wishs[i].wish_comm = comms;
        }
     }
   // console.log(rows.length);
     this.body = this.RESS(200,wishs);

    }catch(e){
      throw new Error(e.message);
    }
});

//根据城市查询许愿条
router.get('/findWishByCity', function*(next) {
  try {
    // var ps = this.request.body;
    // var userId = this.state.user.userId;
    // var page = ps.page;
    // var cityName = ps.cityName;
    // console.log(cityName);
    var wishs = yield userService.findWishByCity(1,'广州市');
    if (wishs.length >= 1) {
      for (var i = 0; i < wishs.length; i++) {
        var imgs = yield userService.findWishImage(wishs[i].wishid);
        var likes = yield userService.findWishLike(wishs[i].wishid);
        var comms = yield userService.findWishComm(wishs[i].wishid);
        wishs[i].wish_img = imgs;
        wishs[i].wish_like = likes;
        wishs[i].wish_comm = comms;
      }

    }
    this.body = this.RESS(200, wishs);
    console.log(wishs);
  } catch (e) {
    throw new Error(e.message);
  }
});

/////////////////////////////
module.exports = router;
