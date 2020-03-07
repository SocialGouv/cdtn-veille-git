import {
  sync,
  getLatestChanges,
  getPreviousSha,
  getJsonFile,
  getJsonDiff
} from "@veille/git";
import serialExec from "promise-serial-exec";
import memoizee from "memoizee";

import { compareArticles } from "../../../../../src/compareArticles";

const compareLegiArticles = (tree1, tree2) =>
  compareArticles(
    tree1,
    tree2,
    (art1, art2) =>
      art1.data.texte !== art2.data.texte || art1.data.etat !== art2.data.etat
  );

const compareKaliArticles = (tree1, tree2) =>
  compareArticles(
    tree1,
    tree2,
    (art1, art2) =>
      art1.data.content !== art2.data.content ||
      art1.data.etat !== art2.data.etat
  );

// exec a compare function on the last diff of given JSON file
const getFileDiff = async ({ compare, cloneDir, path, sha }) => {
  try {
    const previousSha = await getPreviousSha(cloneDir, path, sha);

    const tree1 = await getJsonFile({
      cloneDir,
      path,
      oid: previousSha
    });
    if (!tree1) {
      console.log("cannot load1", path, previousSha);
    }
    const tree2 = await getJsonFile({
      cloneDir,
      path,
      oid: sha
    });
    if (!tree2) {
      console.log("cannot load2", path, sha);
    }

    const changes = compare(tree1, tree2);

    return {
      ...tree2.data,
      changes
    };
  } catch (e) {
    console.log("e", e);
    return {};
  }
};

const getFileDiffKali = async (path, sha) =>
  getFileDiff({
    cloneDir: `/tmp/clones/socialgouv/kali-data`,
    compare: compareKaliArticles,
    path,
    sha
  });

const getFileDiffLegi = async (path, sha) =>
  getFileDiff({
    cloneDir: `/tmp/clones/socialgouv/legi-data`,
    compare: compareLegiArticles,
    path,
    sha
  });

const legiPattern = /^data\/LEGITEXT000006072050\.json$/;
const kaliPattern = /^data\/KALI(?:CONT|ARTI)\d+\.json$/;

// add file change details to some commit
const commitMap = ({ source, filterPath, getFileDiff }) => async commit =>
  await {
    source,
    ...commit,
    files: await serialExec(
      commit.files.filter(filterPath).map(file => async () => ({
        path: file.path,
        ...(await getFileDiff(file.path, commit.hash))
      }))
    )
  };

const legiCommitMap = commitMap({
  source: "LEGI",
  filterPath: file => file.path.match(legiPattern),
  getFileDiff: getFileDiffLegi
});

const kaliCommitMap = commitMap({
  source: "KALI",
  filterPath: file => file.path.match(kaliPattern),
  getFileDiff: getFileDiffKali
});

// commit details never change, lets memoize them
const memoizedLegiCommitMap = memoizee(legiCommitMap, {
  normalizer: args => args[0].hash,
  promise: true
});

const memoizedKaliCommitMap = memoizee(kaliCommitMap, {
  normalizer: args => args[0].hash,
  promise: true
});

const repos = {
  "socialgouv/legi-data": {
    url: `https://github.com/socialgouv/legi-data.git`,
    cloneDir: `/tmp/clones/socialgouv/legi-data`,
    filterPath: path => path.match(legiPattern),
    commitMap: memoizedLegiCommitMap
  },
  "socialgouv/kali-data": {
    url: `https://github.com/socialgouv/kali-data.git`,
    cloneDir: `/tmp/clones/socialgouv/kali-data`,
    filterPath: path => path.match(kaliPattern),
    commitMap: memoizedKaliCommitMap
  }
};

const memoizedGetLatestChanges = memoizee(getLatestChanges, {
  normalizer: args => args[0].cloneDir,
  promise: true
});

// /api/git/[owner]/[repo]/latest
const latest = async (req, res) => {
  const { owner, repo } = req.query;
  //console.log("latest", owner, repo);
  const repoPath = `${owner}/${repo}`;
  const repoConf = repos[repoPath];

  if (!repoConf) {
    res.status(404).json({ error: 404 });
    return;
  }

  const start = 0;
  const limit = 1;

  const t = new Date();
  console.log("get latest changes");
  const changes = (
    await memoizedGetLatestChanges({
      cloneDir: repoConf.cloneDir,
      filterPath: repoConf.filterPath
    })
  ).slice(start, limit);

  //console.log("changes", changes);
  const t2 = new Date();
  console.log(t2 - t);
  console.log("get diffs for these commits");
  const changesWithDiffs = await serialExec(
    // add some metadata to each commit
    changes.map(change => () => repoConf.commitMap(change))
  );
  const t3 = new Date();
  console.log(t3 - t2);

  console.log("res.length", JSON.stringify(changesWithDiffs, null, 2).length);

  // todo: special case : no content has changed, only main ccn.data
  // filter out changes

  res.json(changesWithDiffs);
};

export default latest;
