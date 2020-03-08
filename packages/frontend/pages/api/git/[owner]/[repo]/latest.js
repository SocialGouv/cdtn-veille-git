import { getLatestChanges, getJsonDiff, getFilesChanged } from "@veille/git";
import serialExec from "promise-serial-exec";
import memoizee from "memoizee";

import { compareArticles } from "../../../../../src/compareArticles";

/*
Compute usable diffs from our git repos
Process file changes (ex: AST)
Add some metadata to the commits
*/

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

const getTreeDiffKali = (path, sha) =>
  getJsonDiff({
    cloneDir: `/tmp/clones/socialgouv/kali-data`,
    compareFn: compareKaliArticles,
    path,
    sha
  }).then(({ tree2, changes }) => ({
    ...tree2.data,
    changes
  }));

const getTreeDiffLegi = (path, sha) =>
  getJsonDiff({
    cloneDir: `/tmp/clones/socialgouv/legi-data`,
    compareFn: compareLegiArticles,
    path,
    sha
  }).then(({ tree2, changes }) => ({
    ...tree2.data,
    changes
  }));

const legiPattern = /^data\/LEGITEXT000006072050\.json$/;
const kaliPattern = /^data\/KALI(?:CONT|ARTI)\d+\.json$/;
const fichesVddPattern = /^data\/[^/]+\/.*.json$/;

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
  getFileDiff: getTreeDiffLegi
});

const kaliCommitMap = commitMap({
  source: "KALI",
  filterPath: file => file.path.match(kaliPattern),
  getFileDiff: getTreeDiffKali
});

// commit details never change, lets memoize them
const memoizeCommitMap = commitMap =>
  memoizee(commitMap, {
    normalizer: args => args[0].hash,
    promise: true
  });

const getFicheMeta = (fiche, name) =>
  fiche &&
  fiche.children &&
  fiche.children.length &&
  fiche.children[0].children.find(c => c.name === name);

const getFicheMetaText = (fiche, name) => {
  const node = getFicheMeta(fiche, name);
  return (
    node &&
    node.children &&
    node.children.length &&
    node.children[0] &&
    node.children[0].text
  );
};

const getFicheTitle = data => getFicheMetaText(data, "dc:title");
const getFicheSubject = data => getFicheMetaText(data, "dc:subject");
const getFicheAriane = data => {
  const fil = getFicheMeta(data, "FilDAriane");
  return (
    fil &&
    fil.children &&
    fil.children.length &&
    fil.children.map(c => c.children[0].text).join(" > ")
  );
};

const addVddData = path => {
  const fiche = require(`@socialgouv/fiches-vdd/${path}`);
  return {
    path,
    data: {
      id: fiche.id,
      title: getFicheTitle(fiche),
      subject: getFicheSubject(fiche),
      theme: getFicheAriane(fiche)
    }
  };
};

const repos = {
  "socialgouv/legi-data": {
    url: `https://github.com/socialgouv/legi-data.git`,
    cloneDir: `/tmp/clones/socialgouv/legi-data`,
    filterPath: path => path.match(legiPattern),
    commitMap: memoizeCommitMap(legiCommitMap)
  },
  "socialgouv/kali-data": {
    url: `https://github.com/socialgouv/kali-data.git`,
    cloneDir: `/tmp/clones/socialgouv/kali-data`,
    filterPath: path => path.match(kaliPattern),
    commitMap: memoizeCommitMap(kaliCommitMap)
  },
  "socialgouv/fiches-vdd": {
    url: `https://github.com/socialgouv/fiches-vdd.git`,
    cloneDir: `/tmp/clones/socialgouv/fiches-vdd`,
    filterPath: path => path.match(fichesVddPattern),
    commitMap: async commit => ({
      ...commit,
      ...(await getFilesChanged({
        cloneDir: `/tmp/clones/socialgouv/fiches-vdd`,
        hash: commit.hash
      }).then(changes => {
        return {
          source: "FICHES-SP",
          ...commit,
          changes: {
            added: changes.added.map(addVddData),
            removed: changes.removed.map(addVddData),
            modified: changes.modified.map(addVddData)
          }
        };
      }))
    })
  }
};

const memoizedGetLatestChanges = memoizee(getLatestChanges, {
  normalizer: args => args[0].cloneDir,
  promise: true
});

// /api/git/[owner]/[repo]/latest
const latest = async (req, res) => {
  const { owner, repo } = req.query;
  const repoPath = `${owner}/${repo}`;
  const repoConf = repos[repoPath];

  if (!repoConf) {
    res.status(404).json({ error: 404 });
    return;
  }

  const start = 0;
  const limit = 1;

  const t = new Date();
  console.log("get latest changes", owner, repo);
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
    changes.map(change => () =>
      repoConf.commitMap ? repoConf.commitMap(change) : Promise.resolve(change)
    )
  );
  const t3 = new Date();
  console.log(t3 - t2);

  res.json(changesWithDiffs);
};

export default latest;
