//calculate correctness
import {RepoDetails} from '../apiProcess/gitApiProcess';
import * as helpers from './correctness_helpers';

/* @param metric: RepoDetails - the returned output from getGitRepoDetails
*  @returns score between 0 and 1 evaluated from 
*  - test coverage score
*  - static analysis score
*  - issue ratio
*/
async function calculateCorrectness(metric: RepoDetails, clonedPath: string): Promise<number> {
  // dynamic analysis: compute test coverage score
  const testCoverageScore = await helpers._getCoverageScore(clonedPath);
  // get the issue information: reuse code from responsiveness

  // compute static analysis score: wait for later

  // compute issue ratio
  return 0.5 * testCoverageScore;
}

export{calculateCorrectness};