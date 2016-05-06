/**
 * author: fangcheng
 * 加载整个目录
 * var requireDir = require('./lib/require-dir')
 * 假设文件夹root/adir中有三个js模块，a.js, b.js, c.js
 * a.js exports.af1 = function*(){}
 * b.js exports.bf1 = function*(){}
 * c.js exports.cf1 = function*(){}
 * var dirA = requireDir('./adir');
 * 即可通过dirA.a.af1, dirA.b.bf1这种方式去调用文件夹模块下的方法了
 */

var fs = require('fs');
var path = require('path');

module.exports = (dir, thisDir) => {
  dir = path.isAbsolute(dir)?dir:path.join(thisDir, dir);

  var moduleObj = {};
  var files = fs.readdirSync(dir);
  files.forEach(function(file) {
    if (file.endsWith('.js')) {
      var tmp = file.slice(0, -3).split(/\W/);
      tmp = tmp.shift() + tmp.map(function(i) {
        return i[0].toUpperCase() + i.substring(1)
      }).join('');
      moduleObj[tmp] = require(path.join(dir, file));
    }
  });
  return moduleObj;
};