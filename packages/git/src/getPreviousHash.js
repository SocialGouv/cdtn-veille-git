const { getFileHistory } = require("./getFileHistory");

const getPreviousHash = async (cloneDir, path, hash) => {
  const history = Array.from(
    await getFileHistory({
      cloneDir,
      path
    })
  );
  //console.log("history", history);
  const idx = history.findIndex(log => log.hash === hash);
  const previous =
    idx > -1 && idx < history.length - 1 && history[idx + 1].hash;

  return previous;
};

module.exports = { getPreviousHash };
