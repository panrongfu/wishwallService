var router = require('koa-router')();
var adminService = require('../service/admin/adminService');
var uuid = require('node-uuid');

//创建聊天室
router.post('/admin/createChatroom',function*(next){
  try{
   
    var ps = this.request.body;
    var room_name = ps.roomName;
    var userid = this.state.user.id;
    var room_id = uuid.v1();

    var rong = yield adminService.sendCreateChatroom(room_id,room_name);
    if(rong.code === 200){
      var affect = yield adminService.createChatroom(room_id,userid,room_name);
      if(affect.affectedRows == 1){
        this.body = this.RESS(200,"success");
      }else{
         throw new Error("数据库异常");
      }     
    }else{
      throw new Error("服务器异常");
    }       
  }catch(e){
    throw new Error(e.message)
  }
});
module.exports = router;