const Git = require("simple-git/promise");

// detail affected files for each commit
const getLatestChanges = ({ cloneDir, filterPath = () => true }) => {
  const git = Git(cloneDir);
  return git
    .log(["-n", "50"])
    .then(res => res.all)
    .then(commits =>
      commits.reduce(async (all, commit) => {
        const files = (
          await git.show(["--name-only", "--pretty=format:", commit.hash])
        )
          .split("\n")
          .filter(Boolean)
          // match all data files except index
          .filter(filterPath);

        return [
          ...(await all),
          {
            ...commit,
            files
          }
        ];
      }, [])
    )
    .then(commits => commits.filter(commit => commit.files.length));
};

module.exports = { getLatestChanges };
