import { getLatestChanges } from "@veille/git";
import memoizee from "memoizee";

import repos from "../../../../../src/repos";

const memoizedGetLatestChanges = memoizee(getLatestChanges, {
  normalizer: args => args[0].cloneDir,
  promise: true
});

const getHistory = async (req, res) => {
  const { owner, repo } = req.query;
  const repoPath = `${owner}/${repo}`;
  const repoConf = repos[repoPath];
  if (!repoConf) {
    // todo: conf not found; fallback ?
    res.status(404).json({ error: 404 });
    return;
  }

  console.log("get latest changes", owner, repo);
  const history = await getLatestChanges({
    cloneDir: repoConf.cloneDir,
    filterPath: repoConf.filterPath
  });

  res.json(history);
};

export default getHistory;
