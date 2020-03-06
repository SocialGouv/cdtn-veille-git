const { getFileHistory } = require("./getFileHistory");

const getPreviousSha = async (cloneDir, path, sha) => {
  const history = Array.from(
    await getFileHistory({
      cloneDir,
      path
    })
  );
  //console.log("history", history);
  const idx = history.findIndex(log => log.hash === sha);
  const previous =
    idx > -1 && idx < history.length - 1 && history[idx + 1].hash;

  return previous;
};

module.exports = { getPreviousSha };
