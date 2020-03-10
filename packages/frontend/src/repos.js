import serialExec from "promise-serial-exec";
import { getJsonDiff, getFilesChanged } from "@veille/git";
import memoizee from "memoizee";

import { compareArticles } from "./compareArticles";

const GIT_STORAGE = "/tmp/clones";

console.log("GIT_STORAGE", GIT_STORAGE);

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

const getTreeDiffKali = (path, hash) =>
  getJsonDiff({
    cloneDir: `${GIT_STORAGE}/socialgouv/kali-data`,
    compareFn: compareKaliArticles,
    path,
    hash
  }).then(({ tree2, changes }) => ({
    ...tree2.data,
    changes
  }));

const getTreeDiffLegi = (path, hash) =>
  getJsonDiff({
    cloneDir: `${GIT_STORAGE}/socialgouv/legi-data`,
    compareFn: compareLegiArticles,
    path,
    hash
  }).then(({ tree2, changes }) => ({
    ...tree2.data,
    changes
  }));

const legiPattern = /^data\/LEGITEXT000006072050\.json$/;
const kaliPattern = /^data\/KALI(?:CONT|ARTI)\d+\.json$/;
const fichesVddPattern = /^data\/[^/]+\/.*.json$/;

// add file change details to some commit
const commitProcessor = ({ source, filterPath, getFileDiff }) => async commit =>
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

const legiCommitProcessor = commitProcessor({
  source: "LEGI",
  filterPath: file => file.path.match(legiPattern),
  getFileDiff: getTreeDiffLegi
});

const kaliCommitProcessor = commitProcessor({
  source: "KALI",
  filterPath: file => file.path.match(kaliPattern),
  getFileDiff: getTreeDiffKali
});

const ficheSpCommitProcessor = async commit => {
  const filesChanged = await getFilesChanged({
    cloneDir: `${GIT_STORAGE}/socialgouv/fiches-vdd`,
    hash: commit.hash
  });

  const changes = {
    added: filesChanged.added.map(addVddData),
    removed: filesChanged.removed.map(addVddData),
    modified: filesChanged.modified.map(addVddData)
  };

  return {
    source: "FICHES-SP",
    ...commit,
    changes
  };
};

// commit details never change, lets memoize them by hash
const memoizeProcessor = processor =>
  memoizee(processor, {
    normalizer: commit => commit[0].hash,
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
  // this slow down build considerably
  const fiche = require(`@socialgouv/fiches-vdd/${path}`);
  //{ id: "test", title: "pouet", subject: "kikoo", theme: "lol" };
  // require(`@socialgouv/fiches-vdd/${path}`);
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
    cloneDir: `${GIT_STORAGE}/socialgouv/legi-data`,
    filterPath: path => path.match(legiPattern),
    processCommit: memoizeProcessor(legiCommitProcessor)
  },
  "socialgouv/kali-data": {
    url: `https://github.com/socialgouv/kali-data.git`,
    cloneDir: `${GIT_STORAGE}/socialgouv/kali-data`,
    filterPath: path => path.match(kaliPattern),
    processCommit: memoizeProcessor(kaliCommitProcessor)
  },
  "socialgouv/fiches-vdd": {
    url: `https://github.com/socialgouv/fiches-vdd.git`,
    cloneDir: `${GIT_STORAGE}/socialgouv/fiches-vdd`,
    filterPath: path => path.match(fichesVddPattern),
    processCommit: memoizeProcessor(ficheSpCommitProcessor)
  }
};

export default repos;