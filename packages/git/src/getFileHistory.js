const Git = require("simple-git/promise");

const getFileHistory = ({ cloneDir, path }) => {
  const git = Git(cloneDir);
  return git.log({ file: path }).then(res => res.all);
};

module.exports = { getFileHistory };
