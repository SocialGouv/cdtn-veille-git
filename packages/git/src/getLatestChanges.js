const Git = require("simple-git/promise");

const { showCommit } = require("./showCommit");

// detail affected files for each commit
const getLatestChanges = ({ cloneDir, filterPath = () => true }) => {
  const git = Git(cloneDir);
  return git
    .log(["-n", "100"])
    .then(res => res.all)
    .then(commits =>
      Promise.all(
        commits.map(commit =>
          showCommit({
            cloneDir,
            filterPath,
            hash: commit.hash
          }).then(commitDetails => ({
            ...commit,
            ...commitDetails
          }))
        )
      )
    )
    .then(commits => commits.filter(commit => commit.files.length));
};

module.exports = { getLatestChanges };
