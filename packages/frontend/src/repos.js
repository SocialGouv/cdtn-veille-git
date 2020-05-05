import serialExec from "promise-serial-exec";
import { getJsonDiff, getFilesChanged } from "@veille/git";
import memoizee from "memoizee";

import { compareArticles } from "./compareArticles";

const GIT_STORAGE = process.env.GIT_STORAGE || "../../.submodules";

// todo: ensure the diff is useful, exclude html/format changes
const compareLegiArticles = (tree1, tree2) =>
  compareArticles(
    tree1,
    tree2,
    (art1, art2) =>
      art1.data.texte !== art2.data.texte ||
      art1.data.etat !== art2.data.etat ||
      art1.data.nota !== art2.data.nota
  );

// todo: ensure the diff is useful, exclude html/format changes
const compareKaliArticles = (tree1, tree2) =>
  compareArticles(
    tree1,
    tree2,
    (art1, art2) =>
      art1.data.content !== art2.data.content ||
      art1.data.etat !== art2.data.etat
  );

const getTreeDiffKali = (path, hash) =>
  getJsonDiff({
    cloneDir: `${GIT_STORAGE}/socialgouv/kali-data`,
    compareFn: compareKaliArticles,
    path,
    hash,
  }).then(
    ({ tree2, changes }) =>
      tree2 && {
        ...tree2.data,
        changes,
      }
  );

const getTreeDiffLegi = (path, hash) =>
  getJsonDiff({
    cloneDir: `${GIT_STORAGE}/socialgouv/legi-data`,
    compareFn: compareLegiArticles,
    path,
    hash,
  }).then(
    ({ tree2, changes }) =>
      tree2 && {
        ...tree2.data,
        changes,
      }
  );

const legiPattern = /^data\/LEGITEXT(000006072050|000006073189)\.json$/;
const kaliPattern = /^data\/KALI(?:CONT|ARTI)\d+\.json$/;
const fichesVddPattern = /^data\/[^/]+\/.*.json$/;

// add file change details to some commit
const commitProcessor = ({ source, filterPath, getFileDiff }) => async (
  commit
) =>
  await {
    source,
    ...commit,
    files: await serialExec(
      commit.files.filter(filterPath).map((file) => async () => ({
        path: file.path,
        ...(await getFileDiff(file.path, commit.hash)),
      }))
    ),
  };

const legiCommitProcessor = commitProcessor({
  source: "LEGI",
  filterPath: (file) => file.path.match(legiPattern),
  getFileDiff: getTreeDiffLegi,
});

const kaliCommitProcessor = commitProcessor({
  source: "KALI",
  filterPath: (file) => file.path.match(kaliPattern),
  getFileDiff: getTreeDiffKali,
});

const ficheSpCommitProcessor = async (commit) => {
  const filesChanged = await getFilesChanged({
    cloneDir: `${GIT_STORAGE}/socialgouv/fiches-vdd`,
    hash: commit.hash,
  });

  const changes = {
    added: filesChanged.added.map(addVddData),
    removed: filesChanged.removed.map(addVddData),
    modified: filesChanged.modified.map(addVddData),
  };

  return {
    source: "FICHES-SP",
    ...commit,
    changes,
  };
};

// commit details never change, lets memoize them by hash
const memoizeProcessor = (processor) =>
  memoizee(processor, {
    normalizer: (commit) => commit[0].hash,
    promise: true,
  });

const fichesVDD = require(`@socialgouv/fiches-vdd/data/index.json`);

const addVddData = (path) => {
  try {
    const [type, id] = path
      .replace(/^data\/([^/]+\/[^.]+)\.json$/, "$1")
      .split("/");

    const fiche = fichesVDD.find((f) => f.type === type && f.id === id);
    return {
      path,
      data: {
        id: fiche.id || path || null,
        title: fiche.title || null,
        subject: fiche.subject || null,
        theme: fiche.theme || null,
      },
    };
  } catch (e) {
    return { path, data: {} };
  }
};

const repos = {
  "socialgouv/legi-data": {
    url: `https://github.com/socialgouv/legi-data.git`,
    cloneDir: `${GIT_STORAGE}/socialgouv/legi-data`,
    filterPath: (path) => path.match(legiPattern),
    processCommit: legiCommitProcessor,
  },
  "socialgouv/kali-data": {
    url: `https://github.com/socialgouv/kali-data.git`,
    cloneDir: `${GIT_STORAGE}/socialgouv/kali-data`,
    filterPath: (path) => path.match(kaliPattern),
    processCommit: kaliCommitProcessor,
  },
  "socialgouv/fiches-vdd": {
    url: `https://github.com/socialgouv/fiches-vdd.git`,
    cloneDir: `${GIT_STORAGE}/socialgouv/fiches-vdd`,
    filterPath: (path) => path.match(fichesVddPattern),
    processCommit: ficheSpCommitProcessor,
  },
};

export default repos;
