#! /usr/bin/env node
// 第一句是指定运行环境为node, 必须指定，不然就会报错
const axios = require('axios');

// 获取仓库列表
const fetchRepoList = async () => {
  // 个人所有repo: https://api.github.com/users/用户名/repos。会得到一个repo的JSON格式列表
  const { data } = await axios.get('https://api.github.com/users/Samuel2306/repos')
  return data;
};


module.exports = async (projectName) => {
  let repos = await fetchRepoList();
  repos = repos.map((item) => item.name);
  console.log(repos.join(','));
}

