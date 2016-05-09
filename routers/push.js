var router = require('koa-router')();
var pushService = require('../service/pushService');
var uuid = require('node-uuid');

//发送单聊信息
router.post('/sendMessage', function*(next) {
  try {
    var ps = this.request.body;
    var fromUserId = ps.fromUserId;
    var toUserId = ps.toUserId;
    var message = ps.message;
    var type = ps.objectName;
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
    var result = yield pushService.sendMessage(fromUserId, toUserId, type, messageObject);
    if (result.code == 200) this.body = this.RESS(200, "success");
  } catch (e) {
    throw new Error(e.message);
  }
});

//创建一个群
router.post('/createGroup',function*(next){
  var parameters = this.request.body;
  var userId = this.state.user.userId;
  var groupId = uuid.v1();
  var groupName = parameters.groupName;
  //向融云发送创建群的请求
  var result = yield pushService.sendCreateGroup(userId,groupId,groupName);
  if(result.code == 200){
      var affect = yield pushService.createGroup(groupId,userId,groupName);
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