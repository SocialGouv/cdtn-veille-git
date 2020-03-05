const Git = require("simple-git/promise");
const mkdirp = require("mkdirp");
const path = require("path");

const sync = async sourceData => {
  if (!sourceData) {
    return;
  }
  const dstPath = path.join(__dirname, "..", "..", sourceData.cloneDir);
  console.log("mkdirp", dstPath);
  await mkdirp(dstPath);
  const git = Git(dstPath);
  console.log("checkIsRepo", await git.checkIsRepo());
  if (await git.checkIsRepo()) {
    console.log("pull");
    return git.pull("origin", "master");
  }
  console.log("clone");
  return await git.clone(sourceData.git, dstPath);
};

module.exports = { sync };
