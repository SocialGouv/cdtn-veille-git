const { getJsonFile } = require("./getJsonFile");
const { getPreviousSha } = require("./getPreviousSha");

// exec a compare function on the last diff of given JSON file
const getJsonDiff = async ({ compareFn, cloneDir, path, sha }) => {
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

    return {
      tree1,
      tree2,
      changes: compareFn(tree1, tree2)
    };
  } catch (e) {
    console.log("e", e);
    return {};
  }
};

module.exports = { getJsonDiff };
