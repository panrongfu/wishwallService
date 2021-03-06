var router = require('koa-router')();
var rongcloudSDK = require('../rongCloud');
var userService = require('../service/userService');
var pushService = require('../service/pushService');
var uuid = require('node-uuid');
var jwt = require('koa-jwt');
var fs = require('fs');
var xml2js = require('xml2js');


//更新用户信息
router.post('/updateUserInfo',function*(next){
 
  try{
    var userInfo={};
    var ps = this.request.body;
    console.log(JSON.stringify(ps));
    userInfo.userId = ps.userId;
    userInfo.nickName = ps.nickName;
    userInfo.icon = ps.icon;
    userInfo.sex = ps.sex;
    userInfo.phone = ps.phone;
    userInfo.year  = ps.year;
    userInfo.month = ps.month;
    userInfo.day  = ps.day;
    userInfo.prov = ps.prov;
    userInfo.city = ps.city;
    userInfo.area = ps.area;
    userInfo.wx = ps.wx;
    userInfo.qq = ps.qq;

    var affect = yield userService.updateUserInfo(userInfo)
    if(affect.affectedRows === 1){
      this.body = this.RESS(200,"success");
    }
  }catch(e){
    throw new Error(e.message);
  }
});

//根据用户名查询用户信息
router.post('/findUsersLikeName', function*(next){
  try{
    var ps = this.request.body;
    var nickName = ps.nickName;
    var rows = yield userService.findUsersLikeName(nickName);
    this.body = this.RESS(200,rows);
  }catch(e){
    throw new Error(e.message);
  }
});

//根据用户ID查找用户信息
router.post('/findUserById',function*(next){
  try{
    //var userId = this.state.user.userId;
    var ps = this.request.body;
    var userId = ps.userid;
    var rows = yield userService.findUserById(userId);
    console.log(rows);
    try{
      var provCode = rows.province;
      var cityCode = rows.city;
      var areaCode = rows.area; 
      var provName = yield userService.findCityByCode(1,provCode);
      var cityName = yield userService.findCityByCode(2,cityCode);
      var areaName = yield userService.findCityByCode(3,areaCode);
      rows.province = provName.name;
      rows.city = cityName.name;
      rows.area = areaName.name;
    }catch(e){

    }
    this.body = this.RESS(200,rows);
  }catch(e){
    throw new Error(e.message);
  }
});


//申请添加好友
router.post('/applyAddFriend', function*(next){
  try{
     var ps = this.request.body;
     var userid = ps.userid;
     var friendid = ps.friendid;
     //首先判断是否已经是好友关系
     var hasFriend = yield userService.findFriendIds(userid);
     console.log(JSON.stringify(hasFriend));
  
     for(var i=0; i<hasFriend.result.length; i++){
        if(friendId === hasFriend.result[i].friendid){
          this.body = this.RESS(200,"你们已经是好友啦");
          return;
        }
     }

     var affect = yield userService.applyAddFriend(userid,friendid);
     if(affect.affectedRows === 1) this.body = this.RESS(200,"好友请求成功");
  }catch(e){
    throw new Error(e.message);
  }
});

//添加好友
router.post('/addFriend', function*(next){
  try{
     var ps = this.request.body;
     var userid = ps.userid;
     var friendid = ps.friendid;
     var affect1 = yield userService.addFriend(userid,friendid);
     if(affect1.affectedRows === 1) {
      var affect2 = yield userService.addFriend(friendid,userid);
      if(affect2.affectedRows === 1){
          var update = yield userService.updateApplyFriend(friendid,userid,1);
          if(update.affectedRows === 1 ){
            this.body = this.RESS(200,"success");
          }else{
            throw new Error("未知错误 --updateApplyFriend")
          }
      }else{
        throw new Error("未知错误 --addfriend 002");
      }
     }else{
      throw new Error("未知错误 --addfriend 001");
     }
  }catch(e){
    throw new Error(e.message);
  }
});

//查询用户的好友列表
router.post('/findFriendList',function*(next){
    try{
       var ps = this.request.body;     
       var userid = ps.userid;
       var rows = yield userService.findFriendList(userid);
       this.body = this.RESS(200,rows);
       console.log(JSON.stringify(this.RESS(200,rows))+">>>>>>>>>>>>>");
    }catch(e){
      throw new Error(e.message);
    }
});
//查询申请添加的用户列表（已添加，未添加，拒绝）
router.post('/applyAddFriendList',function*(next){
  try{
      var ps = this.request.body;     
       var userid = ps.userid;
       var rows = yield userService.applyAddFriendList(userid);
       this.body = this.RESS(200,rows);
       console.log(JSON.stringify(this.RESS(200,rows))+">>>>>>>>>>>>>");
  }catch(e){
    throw new Error(e.message);
  }
});

//修改好友关系
router.post('/updateFriend',function*(next){
  try{
      var ps = this.request.body;
      var userid = ps.userid;
      var friendid = ps.friendid;
      var status = ps.status;

      var affect = yield userService.updateFriend(userid,friendid,status);
      if(affect.affectedRows == 1) this.body = this.RESS(200,'success');

  }catch(e){
      throw new Error(e.message);
  }
});

//查询好友列表的id
router.post('/findFriendIds',function*(next){
  try{
     var ps = this.request.body;
     var userId = this.state.user.userId;
     var rows = yield userService.findFriendIds(userId);
     this.body = this.RESS(200,rows);
  }catch(e){
    throw new Error(e.message);
  }
});

//获取所有的群组
router.post('/findAllGroups',function*(next){
  try{
     console.log("findAllGroups"+ ">>>>>>>>>>>");
     var rows = yield userService.findAllGroups();
     this.body = this.RESS(200,rows); 
  }catch(e){
      throw new Error(e.message);
  }  
});

router.post('/findGroupInfoById',function*(next){
  try{
    var ps = this.request.body;
    var groupId = ps.groupId;
    var rows = yield userService.findGroupInfoById(groupId);
    this.body = this.RESS(200,rows);
  }catch(e){
    throw new Error(e.message);
  }

});


//查找用户加入群的所有Id
router.post('/findMyGroups',function*(next){
  try{
    console.log("findMyGroups>>>>>>>>>"); 
    var userId = this.state.user.userId;
    console.log(userId);
    var rows = yield userService.findMyGroups(userId);
    console.log(JSON.stringify(rows)+"<<<<<<<<<<<<<<<<<");
    this.body = this.RESS(200,rows);
  }catch(e){
    throw new Error(e.message);
  }
});
//根据名称查询群组
router.post('/findGroupByName',function*(next){
  try{
      var ps = this.request.body;
      var groupName = ps.groupName;

      var rows = yield userService.findGroupByName(groupName);
      this.body = this.RESS(200,rows);

  }catch(e){
    throw new Error(e.message);
  }
});


router.post('/findAllChatrooms',function*(next){
    try{
      var rows = yield userService.findAllChatrooms();
      this.body = this.RESS(200,rows);
    }catch(e){
      throw new Error(e.message);
    }
});
//根据多个id查询多个用户信息
router.post('/findUsersByIds',function*(next){
    try{
      var ps = this.request.body;
      var ids = ps.ids;
      var rows = yield userService.findUsersByIds(ids);
      this.body = this.RESS(200,rows);
    }catch(e){
      throw new Error(e.message);
    }
});

//////////////////
//省市区三级联动//
//////////////////

//查询所有的省
router.post('/findAllProv',function*(next){
  try{
    var rows = yield userService.findAllProv();
    this.body = this.RESS(200,rows);
  }catch(e){
    throw new Error(e.message);
  }
}); 

//查询省下的市
router.post('/findProvCity',function*(next){
  try{
    var ps = this.request.body;
    var code = ps.code;
    var rows = yield userService.findProvCity(code);
    this.body = this.RESS(200,rows);
  }catch(e){
    throw new Error(e.message);
  }
});
//查询市下的所有区、县
router.post('/findCityArea',function*(next){
    try{
      var ps = this.request.body;
      var code = ps.code;
      var rows = yield userService.findCityArea(code);
      this.body = this.RESS(200,rows);
  }catch(e){
    throw new Error(e.message);
  }
});
//查询城市的对应code值
router.post('/findCodeByName',function*(next){
  try{
     var ps = this.request.body;
     var name = ps.name;
     var rows = yield userService.findCodeByName(name);
     this.body = this.RESS(200,rows);
  }catch(e){
    throw new Error(e.message);
  }
});

//查询所有城市
router.post('/getAllCity',function*(next){
  try{
     var rows = yield userService.getAllCity();
     this.body = this.RESS(200,rows);
  }catch(e){
    throw new Error(e.message);
  }
});

//创建许愿条
router.post('/createWish',function*(next){
  try{
    var ps = this.request.body;
    var userId = ps.userId;
    var wishId = uuid.v1();
    var content = ps.content;
    var cityName = ps.cityName;

    var affect = yield userService.createWish(wishId,userId,content,cityName);
    if(affect.affectedRows === 1){
      this.body = this.RESS(200,wishId);
    }
  }catch(e){
    throw new Error(e.message);
  }
});

//添加许愿条的图片
router.post('/addWishImage',function*(next){
    try{
       var ps = this.request.body;
       var wishId = ps.wishId;
       var wishImgUrl = ps.imgUrls;
       var imgUrls= new Array();
       var affects = new Array();
       imgUrls = wishImgUrl.split(',');

        for(var i = 0; i<imgUrls.length; i++){
            affects[i] =yield userService.addWishImage(wishId,imgUrls[i]);
        }
        for(var j = 0; j<affects.length;j++){
            if(affects[j].affectedRows != 1){
              throw new Error(400,"插入失败");
              return;
            }
        }
        this.body = this.RESS(200,"success");
    }catch(e){
      throw new Error(e.message);
    }
});
//添加个人中心的背景图片
router.post('/addMyCenterPic',function*(next){
  try{
    var ps = this.request.body;
    var picUrl = ps.picUrl;
    var picId = uuid.v1();
    var userId = this.state.user.userId;
    var affect = yield userService.addMyCenterPic(picId,userId,picUrl);
    if(affect.affectedRows === 1){
      this.body = this.RESS(200,"success");
    }
  }catch(e){
    throw new Error(e.message);
  }
});

//查找个人中心背景图片
router.post('/findMyCenterPic',function*(next){
  try{
     var userId = this.state.user.userId;
     var rows = yield userService.findMyCenterPic(userId);
     console.log(JSON.stringify(rows));
     this.body=this.RESS(200,rows);
  }catch(e){
    throw new Error(e.message);
  }
});

//查询我的许愿条
router.post('/findMyWish',function*(next){
    try{
      var ps = this.request.body;
      var page = ps.page;  
      var userId = this.state.user.userId;
      var wishs = yield userService.findMyWish(userId,page);
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
    console.log(wishs);
    }catch(e){
      throw new Error(e.message);
    }
});

//根据城市查询许愿条
router.post('/findWishByCity', function*(next) {
  try {
    var ps = this.request.body;
    var userId = this.state.user.userId;
    var page = ps.page;
    var cityName = ps.cityName;

    console.log(cityName+">>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    var wishs = yield userService.findWishByCity(page,cityName);
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
//根据名称查询许愿条
router.post('/findWishByName',function*(next){
   try {
    var ps = this.request.body;
    var userId = this.state.user.userId;
    var page = ps.page;
    var name = ps.name;
    console.log(name);
    var wishs = yield userService.findWishByName(page,name);
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

//用户反馈意见
router.post('/addUserAdvise',function*(next){
  try{
    var ps = this.request.body;
    var userId = this.state.user.userId; 
    var advise = ps.advise;
    var adviseId = uuid.v1();
    var affect = yield userService.addUserAdvise(adviseId,userId,advise);
    if(affect.affectedRows === 1){
      this.body = this.RESS(200,"success");
    }
  }catch(e){
    throw new Error(e.message);
  }
});

router.post('/likeWish',function*(next){
  try{
    var ps = this.request.body;
    var userId = this.state.user.userId; 
    var wishId = ps.wishId;
    var type = ps.type;
    console.log(+">>>><><<<<<<<<<<<<<<")
    var affect;
    if(type === "UNLIKE"){
        var likeId = ps.likeId;
        console.log("UNLIKE:"+likeId+">>>>>>>>>>>>>");
        affect = yield userService.unLikeWish(likeId,userId);
        console.log("affect:"+affect.affectedRows);
      if(affect.affectedRows === 1 ){
         this.body = this.RESS(200,likeId);
      }
    }else if(type === "LIKE"){
      var likeId = uuid.v1();
      affect = yield userService.likeWish(likeId,wishId,userId);
      if(affect.affectedRows === 1 ){
        this.body = this.RESS(200,likeId);
      }
    }
  }catch(e){
    throw new Error(e.message);
  }
});

router.post('/commWish',function*(){
  try{
    var ps = this.request.body;
    var userId = this.state.user.userId; 
    var wishId = ps.wishId;
    var commText = ps.commText;
    var commId = uuid.v1();
    var affect = yield userService.commWish(commId,wishId,userId,commText);
    if(affect.affectedRows === 1){
      this.body = this.RESS(200,"success");
    }

  }catch(e){
    throw new Error(e.message);
  }

});

//查询好友列表的id
router.post('/findFriendIds',function*(next){
  try{
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>#$#@@#%%%@@@@@@>>>>>>>>>>>>");
    var userId = this.state.user.userId; 
    var rows = yield userService.findFriendIds(userId);
    this.body = this.RESS(200,rows);
    console.log(rows);
  }catch(e){
    throw new Error(e.message);
  }
});

//获取token
router.post('/user/getToken', function*(next) {
  var promise = new Promise(function(resolve, reject) {
    rongcloudSDK.user.getToken('0001', 'Lance', 'http://files.domain.com/avatar.jpg', function(err, resultText) {
      if (err) {
        reject(err);
      } else {
        var result = JSON.parse(resultText);
        resolve(result)
      }
    });
  });
  this.body = yield promise;
});

//检查更新
router.post('/checkForUpdate', function*(next) {
  try{
    var parser = new xml2js.Parser(xml2js.defaults['0.1']);
    var showThis = this;

    var promise = yield new Promise(function(resolve, reject){
      fs.readFile('./updateApk/version.xml', function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    parser.parseString(promise, function(err, result) {
      showThis.body = showThis.RESS(200,result);
      return;
    });
    
  }catch(e){
    console.log(JSON.stringify(e));
    throw new Error(e.message);
  } 
});

//应用错误报告


module.exports = router;

