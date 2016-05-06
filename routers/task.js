var router = require('koa-router')()



//获取所有的群组
router.get('/findGroups',function*(next){
  console.log("findAllGroups"+ ">>>>>>>>>>>");
  try{
     var rows = yield userService.findAllGroups();
     this.body = this.RESS(200,rows); 
  }catch(e){
      throw new Error(e.message);
  }  
});
module.exports = router