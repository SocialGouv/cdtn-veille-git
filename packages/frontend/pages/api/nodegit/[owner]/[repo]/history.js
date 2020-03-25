// import memoizee from "memoizee";

import repos from "../../../../../src/repos";
import { getLatestChanges } from "../../../../../src/git/getLatestChanges";

// const memoizedGetLatestChanges = memoizee(getLatestChanges, {
//   normalizer: args => args[0].cloneDir,
//   promise: true
// });

const getHistory = async (req, res) => {
  const { owner, repo } = req.query;
  const repoPath = `${owner}/${repo}`;
  const repoConf = repos[repoPath];
  if (!repoConf) {
    // todo: conf not found; fallback ?
    res.status(404).json({ error: 404 });
    return;
  }
  const t0 = Date.now();
  const history = await getLatestChanges(repoConf);

  console.log(`get latest changes ${owner}/${repo} in ${Date.now() - t0}`);
  res.json(history);
};

export default getHistory;
