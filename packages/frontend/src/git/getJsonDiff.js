import { Repository } from "nodegit";

export async function getJsonDiff(repoConf, hash, path) {
  const repo = await Repository.open(repoConf.cloneDir);
  const commit = await repo.getCommit(hash);

  const getBlob = entry =>
    entry.getBlob().then(blob => JSON.parse(blob.toString()));

  const [tree, previousTree] = await Promise.all([
    commit.getEntry(path).then(getBlob),
    commit
      .getParents(1)
      .then(([commit]) => commit.getEntry(path))
      .then(getBlob)
  ]);
  // console.log({ previousTree, tree });
  /**
   * note @lionelb
   * Compare trees is a heavy computation process
   * fetching current and previous tree is around 1-2sec
   * while compareTree is about 30sec
   */
  // return { ...tree.data, changes: {} };
  return {
    ...tree.data,
    changes: repoConf.compareFn(previousTree, tree)
  };
}
