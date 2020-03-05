const { getFileHistory } = require("./getFileHistory");
const { getJsonFile } = require("./getJsonFile");
const { getLatestChanges } = require("./getLatestChanges");
const { getRepoHistory } = require("./getRepoHistory");
const { sync } = require("./sync");

module.exports = {
  getFileHistory,
  getJsonFile,
  getLatestChanges,
  getRepoHistory,
  sync
};
