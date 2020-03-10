const Git = require("simple-git/promise");

const getFilesChangedByFilter = ({ cloneDir, hash, diffFilter }) => {
  const git = Git(cloneDir);
  return git
    .show([
      "--name-only",
      `--diff-filter=${diffFilter}`,
      "--pretty=format:",
      hash
    ])
    .then(res =>
      res
        .trim()
        .split("\n")
        .filter(Boolean)
    );
};

// get files changed by commit and status
const getFilesChanged = async ({ cloneDir, hash }) => {
  const added = await getFilesChangedByFilter({
    cloneDir,
    hash,
    diffFilter: "A"
  });
  const modified = await getFilesChangedByFilter({
    cloneDir,
    hash,
    diffFilter: "MTR"
  });
  const removed = await getFilesChangedByFilter({
    cloneDir,
    hash,
    diffFilter: "D"
  });

  return {
    added,
    modified,
    removed
  };
};

module.exports = { getFilesChanged };
