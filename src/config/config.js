const fs = require('fs');
// ini 模块解析配置文件
const { encode, decode } = require('ini');
const { defaultConfig, configFile } = require('../util/constants');
module.exports = (action, k, v) => {
  const flag = fs.existsSync(configFile);
  const obj = {}
  if (flag) { // 配置文件存在
    const content = fs.readFileSync(configFile, 'utf8');
    const c = decode(content); // 将文件解析成对象
    Object.assign(obj, c);
  }

  if (action === 'get') {
    console.log(obj[k] || defaultConfig[k]);
  } else if (action === 'set') {
    obj[k] = v;
    fs.writeFileSync(configFile, encode(obj)); // 将内容转化ini格式写入到字符串中
    console.log(`${k}=${v}`);
  } else if (action === 'getVal') {
    // getVal这个方法是为了在执行init命令时可以获取到配置变量
    return obj[k];
  }
};
