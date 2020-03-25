import { DiffOptions } from "nodegit";

export async function getCommitFiles({ fileFilter }, commit) {
  const opts = new DiffOptions();
  opts.pathspec = fileFilter;
  const diffs = await commit.getDiffWithOptions(opts);
  const deltas = diffs.flatMap(diff => {
    return Array.from(
      { length: diff.numDeltas() },
      (_, index) => index
    ).map(i => diff.getDelta(i));
  });
  return deltas.map(d => d.newFile().path());
}
