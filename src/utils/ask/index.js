// 定制模版的配置选项集合
module.exports = [
  {
    type: 'confirm',
    name: 'private',
    message: 'this resgistery is private?',
    default: true
  },
  {
    type: 'confirm',
    name: 'author',
    message: 'use default author "SF"?',
    default: true
  },
  {
    type: 'confirm',
    name: 'description',
    message: 'use default author "description"?',
    default: true
  },
  {
    type: 'confirm',
    name: 'license',
    message: 'use license?',
    default: false
  }
]
