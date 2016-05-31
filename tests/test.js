
var fs = require('fs');
var path = require('path');
var xml2js = require('xml2js');

var parser = new xml2js.Parser(xml2js.defaults['0.1']);
  fs.readFile('../updateApk/version.xml', function(err,data){
  parser.parseString(data,function(err,result){
    console.log(result);
  });
});

