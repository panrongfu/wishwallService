var koa = require('koa');
var app = koa();
var path = require('path');
var bodyParser = require('koa-bodyparser');
var requireDir = require('./lib/require-dir')
var views = require('koa-views');
var send = require('koa-send');
var jwt = require('koa-jwt');
var unless = require('koa-unless');
var acount = require('./routers/account');
var upload = require('./routers/upload');
var routers = requireDir('./routers', __dirname)
var cors = require('koa-cors');


var option = {
  Origin : '*'
}
//全局结果对象
app.context.RESS = function(code,res) {
  var result = {
    code: code,
    result: res,
    message: 'ok'
  }
  return result;
}
//全局错误结果对象
app.context.ERR = function(msg){
  var err = {
    code:400,
    message: msg
  } 
  return err;
}
//跨域请求
app.use(cors(option));

//处理参数
app.use(bodyParser());

//异常处理
app.use(function*(next) {
  try {   
    yield next;
  } catch (e) {
    console.log(e);
    if (e.status === 401) {
      this.body = this.ERR('TOKEN_INVALID');
      console.log("status:"+e.status);
      return
    }else{
       this.body = this.ERR(e.message);
       console.log("status:"+e.status);
       return
    }
  }
});

//应用路由
app
  .use(acount.routes())
  .use(acount.allowedMethods());

app
  .use(upload.routes())
  .use(upload.allowedMethods());  

app.use(jwt({ secret: 'wishwall-secret' }));

for(i in routers){
  if(i !== 'account' || i !== 'upload'){
  app
    .use(routers[i].routes())
    .use(routers[i].allowedMethods());
  }
}
app.listen(3000);
console.log(3000);