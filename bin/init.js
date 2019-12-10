#! /usr/bin/env node
// 第一句是指定运行环境为node, 必须指定，不然就会报错
const axios = require('axios');
const ora = require('ora');
const Inquirer = require('Inquirer')
const path = require('path')
const fs = require('fs')

const { promisify } = require('util'); // node内置的将异步的api可以快速转化成promise形式的方法
let downLoadGit = require('download-git-repo');  // 拉取git仓库的模块
downLoadGit = promisify(downLoadGit); // 如果不做这个处理就会报错


const MetalSmith = require('metalsmith'); // 遍历文件夹
let { render } = require('consolidate').ejs;
render = promisify(render); // 包装渲染方法

let ncp = require('ncp');
ncp = promisify(ncp);

// 获取仓库列表
const fetchRepoList = async () => {
  // 个人所有repo: https://api.github.com/users/用户名/repos。会得到一个repo的JSON格式列表
  const { data } = await axios.get('https://api.github.com/users/Samuel2306/repos')
  return data;
};

// 获取版本信息
const fetchTagList = async (repo) => {
  const { data } = await axios.get(`https://api.github.com/repos/Samuel2306/${repo}/tags`);
  return data;
};

// 定义下载模版的保存地址
const downloadDirectory = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.bee_template`;
const download = async (repo, tag) => {
  let api = `Samuel2306/${repo}`; // 下载项目
  if (tag) {
    api += `#${tag}`;
  }
  const dest = `${downloadDirectory}/${repo}`; // 将模板下载到对应的目录中
  await downLoadGit(api, dest);
  return dest; // 返回下载目录
};



const wrapFetchAddLoding = (fn, message) => async (...args) => {
  const spinner = ora(message);
  spinner.start(); // 开始loading
  const r = await fn(...args);
  spinner.succeed(); // 结束loading
  return r;
}

module.exports = async (projectName) => {
  // ora模块应该是实现node.js 命令行环境的 loading效果， 和显示各种状态的图标等
  let repos = await wrapFetchAddLoding(fetchRepoList,'fetching repo list')()
  // 选择模版
  // repos = repos.filter((item) => item.name == 'vuex-snapshot');
  repos = repos.map((item) => item.name);
  // 询问工具
  const { repo } = await Inquirer.prompt({
    name: 'repo',
    type: 'list',
    message: 'please choice repo template to create project',
    choices: repos, // 选择模式
  })
  // console.log(repo);

  // 获取版本信息(release版本)
  let tags = await wrapFetchAddLoding(fetchTagList,'fetching repo tags')(repo)

  // 选择版本
  tags = tags.map((item) => item.name);
  const { tag } = await Inquirer.prompt({
    name: 'tag',
    type: 'list',
    message: 'please choice repo template to create project',
    choices: tags,
  });
  // console.log(tag)

  // 下载项目
  const target = await wrapFetchAddLoding(download, 'download template')(repo, tag);

  // 有的时候用户可以定制下载模板中的内容，拿package.json文件为例，用户可以根据提示给项目命名、设置描述等
  // 我们采用ejs模版引擎，核心原理就是将下载的模板文件，依次遍历根据用户填写的信息渲染模板，将渲染好的结果拷贝到执行命令的目录下
  // path.join(path1，path2，path3.......): 将路径片段使用特定的分隔符连接起来形成路径
  if (!fs.existsSync(path.join(target, 'ask.js'))) {  // 没有ask文件说明不需要编译
    // 将下载的文件拷贝到当前执行命令的目录下
    await ncp(target, path.join(path.resolve(), projectName));
  }else {
    await new Promise((resovle, reject) => {
      MetalSmith(__dirname)
        .source(target) // 遍历下载的目录
        .destination(path.join(path.resolve(), projectName)) // 输出渲染后的结果
        .use(async (files, metal, done) => {
          // 弹框询问用户
          const result = await Inquirer.prompt(require(path.join(target, 'ask.js')));
          const data = metal.metadata();
          Object.assign(data, result); // 将询问的结果放到metadata中保证在下一个中间件中可以获取到
          delete files['ask.js'];
          done();
        })
        .use((files, metal, done) => {
          Reflect.ownKeys(files).forEach(async (file) => {
            let content = files[file].contents.toString(); // 获取文件中的内容
            if (file.includes('.js') || file.includes('.json')) { // 如果是js或者json才有可能是模板
              if (content.includes('<%')) { // 文件中用<% 我才需要编译
                content = await render(content, metal.metadata()); // 用数据渲染模板
                files[file].contents = Buffer.from(content); // 渲染好的结果替换即可
              }
            }
          });
          done();
        })
        .build((err) => { // 执行中间件
          if (!err) {
            resovle();
          } else {
            reject();
          }
        });
    })
  }

}

