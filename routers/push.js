var router = require('koa-router')();
var pushService = require('../service/pushService');
var uuid = require('node-uuid');
var userService = require('../service/userService');

//发送单聊信息
router.post('/sendMessage', function*(next) {
  try {
    var ps = this.request.body;
    var fromUserId = ps.fromUserId;
    var toUserId = ps.toUserId;
    var message = ps.message;
    var type = ps.objectName;
    var msgType = ps.msgType;//两种情况1、请求添加好友 2、同意添加好友
    var messageObject = {};
    if (type === 'RC:ContactNtf') {
      messageObject = {
        operation: "op1",
        sourceUserId: fromUserId,
        targetUserId: toUserId,
        message: message,
        extra: message
      };
    } else if (type === 'RC:TxtMsg') {
      messageObject = {
        content: message
      };
    }
    //先进行判断是否已经是好友关系
    if(msgType === "APPLY"){
       var has = yield userService.findFriendIds(fromUserId);
       for (var i = 0; i < has.length; i++) {
          if (toUserId === has[i].friendid) {    
             this.body = this.RESS(200, "你们已经是好友啦");
             return;
          }
       }
    }
     //向融云发送单聊信息（好友请求） 
    var result = yield pushService.sendMessage(fromUserId, toUserId, type, messageObject);
    if (result.code == 200) {
      if(msgType === "APPLY"){
         var affect = yield userService.applyAddFriend(fromUserId, toUserId);
         if (affect.affectedRows == 1) {
            this.body = this.RESS(200, "好友请求成功");
         }
      }else if(msgType === "ADD"){    
        this.body = this.RESS(200,"添加成功");
      } 
    }  
  } catch (e) {
    throw new Error(e.message);
  }
});

//创建一个群
router.post('/createGroup',function*(next){
  var ps = this.request.body;
  var userId = this.state.user.userId;
  var groupId = uuid.v1();
  var groupName = ps.groupName;
  var groupDes = ps.describe;
  var groupIcon;
  try{
     groupIcon = ps.groupIcon;
  }catch(e){

  }
  
  //向融云发送创建群的请求
  var result = yield pushService.sendCreateGroup(userId,groupId,groupName);
  if(result.code == 200){
      var affect = yield pushService.createGroup(groupId,userId,groupName,groupDes,groupIcon);
      if(affect.affectedRows == 1){
           var rong = yield pushService.sendJoinGroup(userId, groupId, groupName);
           if(rong.code === 200){
              var joionGroup = yield pushService.joinGroup(userId, groupId);
              if(joionGroup.affectedRows == 1){
                    var updateGroup = yield pushService.updateGroup(1,groupId);
                  if(updateGroup.affectedRows == 1){
                       this.body = this.RESS(200,"success");
                  }else{
                    throw new Error("未知错误-WJQ")
                  }
              }else{
                throw new Error("未知错误 -WWJG")
              }  
           }else{
            throw new Error("未知错误-RYJQ")
           }
      }else{
        throw new Error("创建群失败-sjk")
      }  
  }else{
     throw new Error("创建群失败-rcloud");
  } 
});


//加入一个群
router.post('/joinGroup', function*(next) {
  var ps = this.request.body;
  var userId = ps.userId;
  var groupId = ps.groupId;
  var number = ps.number;
  var groupName = ps.groupName;
   //向融云发送加入群的请求
  var rong = yield pushService.sendJoinGroup(userId, groupId, groupName);
  if (rong.code == 200) { 
    var affect = yield pushService.joinGroup(userId, groupId);
    if (affect.affectedRows == 1) {  
      var affect = yield pushService.updateGroup(1,groupId);
      if (affect.affectedRows == 1) {
        this.body = this.RESS(200,"success");
      } else {
         throw new Error("未知错误-wjg");
      }
    } else {
      throw new Error("未知错误-wjg");
    }
    return;
  } 
  throw new Error("未知错误-rjg");
});

//退出群
router.post('/quitGroup', function*(next) {
  var ps = this.request.body;
  var userId = ps.userId;
  var groupId = ps.groupId;
  var number = ps.number;
  //向融云服务器发送退群请求
  var rong = yield pushService.sendQuitGroup(userId, groupId);
  if (rong.code == 200) {
    var quitAffect = yield pushService.quitGroup(userId, groupId);
    if (quitAffect.affectedRows == 1) {  
      var updateAffect = yield pushService.updateGroup(-1, groupId);
      if (updateAffect.affectedRows == 1) {

        this.body = this.RESS(200,"success");

      } else {
        throw new Error("未知错误-wqg");
      }
    } else {
      throw new Error("未知错误-wqg");
    }
    return;
  } 
  throw new Error("未知错误-rqg");
});
module.exports = router;