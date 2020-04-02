const Git = require("simple-git/promise");

const showCommit = async ({ cloneDir, filterPath, hash }) => {
  const git = Git(cloneDir);
  const files = await git.show(["--name-only", "--pretty=format:", hash]);
  if (files) {
    return {
      hash,
      files: files
        .split("\n")
        .filter(Boolean)
        .filter(filterPath)
        .map(path => ({ path }))
    };
  }

  return {
    hash,
    files: []
  };
};

module.exports = { showCommit };
