import * as dotenv from "dotenv";
dotenv.config();
import { RepoDetails } from "../apiProcess/gitApiProcess";
import { log } from "../logger";

/*
  @params: metrics: RepoDetails - the returned output from getGithubInfo(...)
  @returns: score between 0 and 1 evaluated from:
  - commit history by user name
*/
export function calculateBusFactor(metrics: RepoDetails): number {
  log.info("In calculateBusFactor, starting to calculate bus factor...");

  // Check if there are any commits available
  if (metrics.commitsData.length == 0) {
    log.debug("No commits available for bus factor calculation");
    return 0;
  }

  // Get commit counts grouped by user name, ignore all anonymous/unknown authors
  log.info("In calculateBusFactor, grouping commit history by user name...");
  const commitCounts: { [key: string]: number } = {};
  metrics.commitsData.forEach((commit: any) => {
    const author = commit.author
      ? commit.author.login
        ? commit.author.login
        : commit.author.name
      : "unknown";
    if (author != "unknown") {
      if (!commitCounts[author]) {
        commitCounts[author] = 0;
      }
      commitCounts[author]++;
    }
  });

  // Calculating benchmark values
  log.info("In calculateBusFactor, calculating benchmark values...");
  const totalCommits = Object.values(commitCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  const totalContributors = Object.keys(commitCounts).length;
  const commitsForCoreContributors = Math.ceil(0.1 * totalCommits);
  const benchmarkContributors = Math.ceil(0.5 * totalContributors);

  // Debug statements for benchmark values
  log.debug(
    "Total number of contributors that made commits:",
    totalContributors,
  );
  log.debug(
    "Benchmark number commits to be considered a core contributor:",
    commitsForCoreContributors,
  );
  log.debug(
    "Benchmark number of contributors for high bus factor:",
    benchmarkContributors,
  );

  // Error handling for divide by zero
  if (benchmarkContributors == 0) {
    log.debug("There are 0 known contributors, therefore bus factor is 0");
    return 0;
  }

  // Filter core contributors if they have >= 10% of total commits
  log.info(
    "In calculateBusFactor, filtering core contributors based on commits...",
  );
  const coreContributors =
    Object.values(commitCounts).filter(
      (count) => count >= commitsForCoreContributors,
    ).length || 0;

  log.info("In calculateBusFactor, normalizing bus factor value...");
  const coreContributorsRatio = Math.min(
    Math.max(coreContributors / benchmarkContributors, 0),
    1,
  );
  log.debug("Calculated Bus factor:", coreContributorsRatio);

  log.info("Finished calculating bus factor. Exiting...");
  return coreContributorsRatio;
}
