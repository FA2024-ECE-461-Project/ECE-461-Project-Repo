import * as dotenv from "dotenv";
dotenv.config();
import { RepoDetails } from "../apiProcess/gitApiProcess";
import { log } from "../logger";

/*
  Function Name: calculateBusFactor
  Description: This function calculates the bus factor of a repository
  @params: metrics: RepoDetails - the returned output from getGithubInfo(...)
  @returns: score between 0 and 1 evaluated from:
  - commit history by user name
*/
export function calculateBusFactor(metrics: RepoDetails): number {
  log.info("In calculateBusFactor, starting to calculate bus factor...");

  // Calculating total contributors and total commits
  let totalContributors = metrics.contributorsData.length;

  // Check if there are any contributors available + corner case for 1 contributor
  if (totalContributors == 0 || totalContributors == 1) {
    if (totalContributors == 1) {
      log.debug("Bus factor is 1 as there is only 1 contributor");
    } else {
      log.debug("No contributors available for bus factor calculation");
    }
    return 0;
  }

  let totalCommits = 0;
  for (let i = 0; i < metrics.contributorsData.length; i++) {
    const contributor = metrics.contributorsData[i];
    totalCommits += contributor.total || 0;
  }

  // Check if there are any commits available
  if (totalCommits == 0) {
    log.debug("No commits available for bus factor calculation");
    return 0;
  }

  log.debug("Total Commits before removing outliers:", totalCommits);
  log.debug("Total Contributors before removing outliers:", totalContributors);

  // Sort contributors in descending order of commits
  let sortedCommitCounts = metrics.contributorsData.sort(
    (a, b) => b.total - a.total,
  );
  // Filter out contributors with less than 0.5% of total commits -> outliers
  sortedCommitCounts = sortedCommitCounts.filter(
    (contributor) => contributor.total >= 0.005 * totalCommits,
  );
  // Update total commits and total contributors
  totalCommits = sortedCommitCounts.reduce(
    (total, contributor) => total + contributor.total,
    0,
  );
  totalContributors = sortedCommitCounts.length;

  log.debug("Total Commits after removing outliers:", totalCommits);
  log.debug("Total Contributors after removing outliers:", totalContributors);

  // Evaluate Core Contributors
  let cumulativeContribution = 0;
  let numCoreContributors = 0;
  const threshold = 0.8;
  for (const contributor of sortedCommitCounts) {
    cumulativeContribution += contributor.total / totalCommits;
    numCoreContributors++;
    if (cumulativeContribution >= threshold) {
      break;
    }
  }

  log.debug("Number of Core Contributors:", numCoreContributors);
  log.debug("Total Contributors:", totalContributors);

  // Calculate coreContributorsratio, ensure the bus factor is between 0 and 1
  const coreContributorsRatio = Math.min(
    Math.max(numCoreContributors / (0.35 * totalContributors), 0),
    1,
  );

  // Debug statement for calculated bus factor
  log.debug("Calculated Bus factor:", coreContributorsRatio);

  log.info("Finished calculating bus factor. Exiting...");
  return coreContributorsRatio;
}
