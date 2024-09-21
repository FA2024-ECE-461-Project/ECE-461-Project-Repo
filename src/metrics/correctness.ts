//calculate correctness
import { RepoDetails } from "../apiProcess/gitApiProcess";
import * as helpers from "./correctness_helpers";
import { log } from "../logger";
/* @param metric: RepoDetails - the returned output from getGitRepoDetails
 *  @returns score between 0 and 1 evaluated from
 *  - test coverage score
 *  - static analysis score
 *  - issue ratio
 */
async function calculateCorrectness(
  metric: RepoDetails,
  clonedPath: string,
): Promise<number> {
  log.debug(`In calculateCorrectness, Calculating correctness ...`);

  //fetch all information needed (add onto it if needed)
  const issueInfo = await helpers._getIssues(metric.owner, metric.repo);
  // dynamic analysis: compute test coverage score
  const testCoverageScore = await helpers._getCoverageScore(clonedPath);
  
  // compute issue ratio
  const issueRatio = issueInfo.open_issues_count / issueInfo.total_issues_count;
  return 0.5 * testCoverageScore + 0.5 * issueRatio;
}

export { calculateCorrectness };
