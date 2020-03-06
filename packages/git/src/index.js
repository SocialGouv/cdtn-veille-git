const { getFileHistory } = require("./getFileHistory");
const { getJsonDiff } = require("./getJsonDiff");
const { getJsonFile } = require("./getJsonFile");
const { getLatestChanges } = require("./getLatestChanges");
const { getRepoHistory } = require("./getRepoHistory");
const { getPreviousSha } = require("./getPreviousSha");
const { sync } = require("./sync");

module.exports = {
  getFileHistory,
  getJsonDiff,
  getJsonFile,
  getLatestChanges,
  getRepoHistory,
  getPreviousSha,
  sync
};
