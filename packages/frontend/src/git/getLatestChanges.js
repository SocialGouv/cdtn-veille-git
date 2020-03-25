import { Repository, Revwalk } from "nodegit";
import { getCommitFiles } from "./getCommitFiles";

const getLatestChanges = async repoConf => {
  const repo = await Repository.open(repoConf.cloneDir);
  const walker = repo.createRevWalk();
  walker.sorting(Revwalk.SORT.TOPOLOGICAL);
  walker.pushHead();
  return walker.getCommits(100).then(async commits => {
    const commitsWithFiles = await Promise.all(
      commits.map(async commit => {
        const files = await getCommitFiles(repoConf, commit);

        return {
          sha: commit.sha(),
          date: commit.date(),
          message: commit.message(),
          author_name: commit.author().name(),
          author_email: commit.author().email(),
          files
        };
      })
    );
    return commitsWithFiles.filter(({ files }) => files.length);
  });
};

export { getLatestChanges };
