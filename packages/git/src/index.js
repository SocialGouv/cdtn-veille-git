const { getFileHistory } = require("./getFileHistory");
const { getJsonDiff } = require("./getJsonDiff");
const { getJsonFile } = require("./getJsonFile");
const { getLatestChanges } = require("./getLatestChanges");
const { getRepoHistory } = require("./getRepoHistory");
const { getPreviousHash } = require("./getPreviousHash");
const { getFilesChanged } = require("./getFilesChanged");
const { showCommit } = require("./showCommit");
const { sync } = require("./sync");

module.exports = {
  getFileHistory,
  getJsonDiff,
  getJsonFile,
  getLatestChanges,
  getRepoHistory,
  getPreviousHash,
  getFilesChanged,
  showCommit,
  sync
};
