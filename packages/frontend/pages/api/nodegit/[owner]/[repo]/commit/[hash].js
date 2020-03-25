import { Repository } from "nodegit";
import repos from "../../../../../../src/repos";
import { getCommitFiles } from "../../../../../../src/git/getCommitFiles";
import { getJsonDiff } from "../../../../../../src/git/getJsonDiff";

const getChanges = async (req, res) => {
  const { owner, repo, hash = "latest" } = req.query;
  const repoPath = `${owner}/${repo}`;
  const repoConf = repos[repoPath];
  if (!repoConf) {
    // todo: conf not found; fallback ?
    res.status(404).json({ error: 404 });
    return;
  }
  const t0 = new Date();
  const commit = await getCommit(repoConf, hash);

  const files = await getCommitFiles(repoConf, commit);
  const diffs = await Promise.all(
    files.map(path => getJsonDiff(repoConf, hash, path))
  );
  console.log(`get hash changes ${owner}/${repo} in ${Date.now() - t0}`);
  res.json(diffs);
};

export default getChanges;

async function getCommit({ cloneDir }, hash) {
  const repo = await Repository.open(cloneDir);
  return repo.getCommit(hash);
}
