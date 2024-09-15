//calculate correctness
import { exec } from 'child_process'; // for cloning remote repos to do anaylsis
import { promisify } from 'util';
import * as path from 'path';
import {RepoDetails} from '../apiProcess/gitApiProcess';
import * as helpers from './correctness_helpers';

const execAsync = promisify(exec); // allowing us to use async/await with exec

async function calculateCorrectness(metric: RepoDetails): Promise<number> {
  //fetch all information needed (add onto it if needed)
  const [issueInfo, hasTestSuite]: [helpers.GitHubIssues, Boolean] = await Promise.all([
    helpers._getIssues(metric.owner, metric.repo),
    helpers._hasTestSuite(metric.owner, metric.repo)
  ]);

  // compute test coverage score: dynamic analysis
  // I am assuming all tests are created with jest
  let testCoverageScore = 0;
  if(hasTestSuite){
    // getting current path, might be troublesome later if this function is called elsewhere
    let currentPath = process.cwd();
    currentPath = path.basename(currentPath);
    testCoverageScore = await helpers._getCoverageScore(metric.owner, metric.repo, currentPath);
  }
  // compute static analysis score


  //remove the cloned repo
  await execAsync(`rm -rf /tmp/${metric.repo}`);

  // compute issue ratio
  const issueRatio = issueInfo.open_issues_count / issueInfo.total_issues_count;
  return 0.5 * testCoverageScore + 0.25 * issueRatio;
}

export{calculateCorrectness};