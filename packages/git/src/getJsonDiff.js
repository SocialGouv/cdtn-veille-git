const { getJsonFile } = require("./getJsonFile");
const { getPreviousHash } = require("./getPreviousHash");

// exec a compare function on the last diff of given JSON file
const getJsonDiff = async ({ compareFn, cloneDir, path, hash }) => {
  try {
    const previousHash = await getPreviousHash(cloneDir, path, hash);

    const tree1 = await getJsonFile({
      cloneDir,
      path,
      oid: previousHash
    });
    if (!tree1) {
      console.log("cannot load1", path, previousHash);
    }
    const tree2 = await getJsonFile({
      cloneDir,
      path,
      oid: hash
    });
    if (!tree2) {
      console.log("cannot load2", path, hash);
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
