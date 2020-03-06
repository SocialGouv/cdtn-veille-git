const Git = require("simple-git/promise");
const mkdirp = require("mkdirp");

const sync = async ({ url, cloneDir }) => {
  await mkdirp(cloneDir);
  const git = Git(cloneDir);
  if (await git.checkIsRepo()) {
    return git.pull("origin", "master");
  }
  return await git.clone(url, cloneDir);
};

module.exports = { sync };
