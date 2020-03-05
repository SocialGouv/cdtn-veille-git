const Git = require("simple-git/promise");

const wait = (duration = 500) => res =>
  new Promise(resolve => setTimeout(() => resolve(res), duration));

const getJsonFile = async ({ cloneDir, path, oid }) => {
  const git = Git(cloneDir);
  const data = await git.show([
    `${oid}:${path}`,
    "--pretty=format:%H",
    "--quiet"
  ]);
  try {
    const json = JSON.parse(data);
    return json;
  } catch (e) {
    //  console.log("data", data);
    console.log("e", e);
    console.log("ERR: cannot parse JSON", path, oid);
  }
  return null;
};

module.exports = { getJsonFile };
