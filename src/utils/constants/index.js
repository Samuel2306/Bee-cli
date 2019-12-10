const {
  name,
  version
} = require('../../../package.json')
// process.platform：返回当前平台类型（'darwin', 'freebsd', 'linux', 'sunos' 或者 'win32'）
const configFile = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.beerc`; // 配置文件的存储位置
console.log(process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE'])
const defaultConfig = {
  repo: 'bee-cli', // 默认拉取的仓库名
};

module.exports = {
  name,
  version,
  configFile,
  defaultConfig
}
