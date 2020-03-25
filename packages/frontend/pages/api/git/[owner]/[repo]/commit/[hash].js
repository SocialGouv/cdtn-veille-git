import { showCommit } from "@veille/git";
import memoizee from "memoizee";

import repos from "../../../../../../src/repos";

/*
Compute usable diffs from our git repos
Process file changes (ex: AST)
Add some metadata to the commits
*/

// commit infos can be cached
const memoizedShowCommit = memoizee(showCommit, {
  normalizer: args => args[0].cloneDir + args[0].hash,
  promise: true
});

//
// /api/git/[owner]/[repo]/hash
// return given commit changes
//
const getChanges = async (req, res) => {
  const { owner, repo, hash = "latest" } = req.query;
  const repoPath = `${owner}/${repo}`;
  const repoConf = repos[repoPath];
  if (!repoConf) {
    // todo: conf not found; fallback ?
    res.status(404).json({ error: 404 });
    return;
  }

  const t = new Date();
  // console.log("get commit", owner, repo, hash);

  const commit = await showCommit({
    cloneDir: repoConf.cloneDir,
    filterPath: repoConf.filterPath,
    hash
  });

  // const t2 = new Date();
  // console.log(t2 - t);
  // console.log("get diffs for these commits");

  const changes = await repoConf.processCommit(commit);

  // const t3 = new Date();
  // console.log(t3 - t2);
  console.log(`get hash changes ${owner}/${repo} in ${Date.now() - t}`);
  res.json(changes);
};

export const getStaticPaths = async () => {
  console.log("wahhhht");
  return {
    paths: []
  };
};

export default getChanges;
