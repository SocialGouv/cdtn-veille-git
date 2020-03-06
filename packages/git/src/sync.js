const Git = require("simple-git/promise");
const mkdirp = require("mkdirp");

const sync = async ({ url, cloneDir }) => {
  console.log("mkdirp", cloneDir);
  await mkdirp(cloneDir);
  const git = Git(cloneDir);
  console.log("checkIsRepo", await git.checkIsRepo());
  if (await git.checkIsRepo()) {
    console.log("pull");
    return git.pull("origin", "master");
  }
  console.log("clone");
  return await git.clone(url, cloneDir);
};

module.exports = { sync };
