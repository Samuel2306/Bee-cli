#! /usr/bin/env node
// 第一句是指定运行环境为node, 必须指定，不然就会报错
const axios = require('axios');
const ora = require('ora');
const Inquirer = require('Inquirer')

const { promisify } = require('util'); // node内置的将异步的api可以快速转化成promise形式的方法
const downLoadGit = require('download-git-repo');  // 拉取git仓库的模块

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

const wrapFetchAddLoding = (fn, message) => async (...args) => {
  const spinner = ora(message);
  spinner.start(); // 开始loading
  const r = await fn(...args);
  console.log(r)
  spinner.succeed(); // 结束loading
  return r;
}

module.exports = async (projectName) => {
  // ora模块应该是实现node.js 命令行环境的 loading效果， 和显示各种状态的图标等
  let repos = await wrapFetchAddLoding(fetchRepoList,'fetching repo list')()
  // 选择模版
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
}

