var router = require('koa-router')();
var STS = require('ali-oss').STS;
var co = require('co');
var fs = require('fs');

//向阿里云发送获取token请求
router.post('/getUploadToken', function*(next) {
  
  try{
    var conf = JSON.parse(fs.readFileSync('./config.json'));
    var policy;
    if (conf.PolicyFile) {
      policy = fs.readFileSync(conf.PolicyFile).toString('utf-8');
    }
    var client = new STS({
      accessKeyId: conf.AccessKeyId,
      accessKeySecret: conf.AccessKeySecret,
    });
    var result = yield client.assumeRole(conf.RoleArn, policy, conf.TokenExpireTime);
    console.log(JSON.stringify(result));
    if(result.res.status === 200 ){
      var res={};
      res.AccessKeyId = result.credentials.AccessKeyId;
      res.AccessKeySecret = result.credentials.AccessKeySecret;
      res.SecurityToken = result.credentials.SecurityToken;
      res.Expiration = result.credentials.Expiration;
      this.body = this.RESS(200,res);    
      return;
    }
    this.body = this.RESS(400,"fail");
  }catch(e){
    throw new Error(e.message);
  }
});

module.exports = router;
