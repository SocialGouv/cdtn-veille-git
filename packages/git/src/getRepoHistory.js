const Git = require("simple-git/promise");

const getRepoHistory = ({ cloneDir }) => {
  const git = Git(cloneDir);
  return git.log().then(res => res.all);
};

module.exports = { getRepoHistory };
