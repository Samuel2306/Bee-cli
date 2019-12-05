#! /usr/bin/env node
// 第一句是指定运行环境为node, 必须指定，不然就会报错
const program = require('commander')
const path = require('path')

const { version } = require('./utils/constants')


// 定义执行动作，遍历产生对应的命令
const actionsMap = {
  init: { // 创建模版
    description: 'create project',
    examples: [
      'sf init <template-name>',
    ]
  },
  config: {
    description: 'config info',
    examples: [
      'sf config get <k>',
      'sf config set <k> <v>',
    ]
  },
  '*': {
    description: 'command not found',
  }
}

Object.keys(actionsMap).forEach((action) => {
  program
    .command(action) // 命令的名称
    .description(actionsMap[action].description) // 命令的描述
    .action(() => {
      // 定义具体动作
      if(action === '*'){ // 如果动作没匹配到说明输入有误
        console.log(acitonMap[action].description);
      }else{
        // 引用对应的动作文件 将参数传入
        // ...process.argv.slice(3)获取命令的参数
        require(path.resolve(__dirname, '../bin/' + action + '.js'))(...process.argv.slice(3));
      }
    });
})
// commander可以自动生成help，解析选项参数
program.on('--help', () => {
  Object.keys(actionsMap).forEach((action) => {
    (actionsMap[action].examples || []).forEach((example) => {
      console.log(`${example}`);
    });
  });
})


program
  .version(version) // 当前cli项目的版本号
  .parse(process.argv) // process.argv就是用户在命令行中传入的参数
