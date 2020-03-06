const { getJsonFile } = require("./getJsonFile");

// compare a JSON at two different SHA
const getJsonDiff = async ({ compare, cloneDir, path, sha1, sha2 }) => {
  const tree1 = await getJsonFile({
    cloneDir,
    path,
    oid: sha1
  });
  if (!tree1) {
    console.log("cannot load1", path, sha1);
  }
  const tree2 = await getJsonFile({
    cloneDir,
    path,
    oid: sha2
  });
  if (!tree2) {
    console.log("cannot load2", path, sha2);
  }
  return tree1 && tree2 && compare(tree1, tree2);
};

module.exports = { getJsonDiff };
