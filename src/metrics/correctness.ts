//calculate correctness
import axios from 'axios';
import * as fs from 'fs';
import exp from 'node:constants';
import {RepoDetails} from '../apiProcess/gitApiProcess';
import * as path from 'path';
import * as util from 'util';
import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from a .env file into process.env

/* @param metric: RepoDetails - the returned output from getGitRepoDetails
*  @returns score between 0 and 1 evaluated from 
*  - test coverage score
*  - static analysis score
*  - issue ratio
*/
async function calculateCorrectness(metric: RepoDetails, clonedPath: string): Promise<number> {
  // dynamic analysis: compute test coverage score
  const testCoverageScore = await _getCoverageScore(clonedPath);

  // compute static analysis score: wait for later

  // compute issue ratio
  const openToClosedIssueRatio = _computeOpenToClosedIssueRatio(metric);
  console.log(`${metric.repo} - testCoverageScore: ${testCoverageScore}, openToClosedIssueRatio: ${openToClosedIssueRatio}`);
  return 0.5 * testCoverageScore + 0.5 * openToClosedIssueRatio;
}

//helpers
function _computeOpenToClosedIssueRatio(metric: RepoDetails): number {
  // Check if there are any commits available
  if (metric.issuesData.length == 0) {
    //console.error('No commits data available for calculating responsiveness');
    return 0;
  }
  
  let issuRatio;
  // Determine the start date for the 6-month period (or less if not enough data)
  const dateEarliestIssue = new Date(metric.issuesData[metric.issuesData.length - 1].created_at);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 1);
  const startDateIssues = dateEarliestIssue > sixMonthsAgo ? dateEarliestIssue : sixMonthsAgo;

  // current date
  const currentDate = new Date();
  // constant value to convert time difference to weeks: for time conversion later
  const millisecondsInAWeek = 1000 * 60 * 60 * 24 * 7;

  const issues = metric.issuesData;
  //const issuesCurrentlyOpen = issues.filter(issue => issue.state === 'open');
  const issuesOpenedPast6Months = issues.filter((issue) => { new Date(issue.created_at) >= startDateIssues});
  const closedIssuesPast6Months = issuesOpenedPast6Months.filter(issue => issue.state === 'closed');

  if (issuesOpenedPast6Months.length === 0 || closedIssuesPast6Months.length === 0) {
    issuRatio = 0;
  } else {
    issuRatio = closedIssuesPast6Months.length / issuesOpenedPast6Months.length;
  }
  return issuRatio;
}


/* 
*  @param clonedPath: string - the path of the cloned repository
*  @returns string | null - the path of the test folder or null if not found
* */

async function __findTestOrSrc(directoryPath: string, targetFolderName: string): Promise<string | null> {
  let keywrods: string[];

  if(targetFolderName === 'test') {
    keywrods = ['test', 'tests', 'spec', '__tests__'];
  } else if (targetFolderName === 'src') {
    keywrods = ['src', 'source', 'lib', 'app'];
  } else {
    throw new Error('Invalid target folder name, only "test" and "src" are allowed');
  }

  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        return reject(err);
      }
      // scan the directory for the target folder
      for (const file of files) {
        if (file.isDirectory() && keywrods.includes(file.name)) {
          return resolve(path.join(directoryPath, file.name));
        }
      }
      resolve(null);  //return null if target folder is not found
    });
  });
}

async function __countFilesInDirectory(dirPath: string, count: number = 0): Promise<number> {
  // DO NOT "shell out": instead use the path or fs module to do file traversal
  if(fs.existsSync(dirPath)) {
    const filesList = await fs.promises.readdir(dirPath, { withFileTypes: true }); // use readdir (an async method) to prevent blocking event loop
    for(const file of filesList) {
      if(file.isDirectory()) { // if file is a directory, descent into it with recursion and update count
        const subdirPath = path.join(dirPath, file.name);
        count = await __countFilesInDirectory(subdirPath, count);
      } else {
        count++;
      }
    }
  }
  return count;
}

/* @param clonedPath: string - the path of the cloned repository
*  @returns number - the coverage score of the repository
*  compute coverageScore specified by clonedPath based on the following criteria:
* - presence of CI/CD configuration files
* - ratio of test files to source files
* formula(s) for calculation will differ based on the file structure of the repository, but must
* ensure the coverageScore is between 0 and 1.
* */
async function _getCoverageScore(clonedPath: string): Promise<number> {
  if(!fs.existsSync(clonedPath)) {
    throw new Error('Cloned path does not exist');
  }

  // Check for CI/CD configuration files 
  const ciFiles = ['.travis.yml', 'circle.yml', 'Jenkinsfile', 'azure-pipelines.yml', '.github/workflows'];
  let coverageScore = 0;
  for (const ciFile of ciFiles) {
    const ciFilePath = path.join(clonedPath, ciFile);
    if (fs.existsSync(ciFilePath)) {
      // if any of the CI/CD files exist, set coverageScore to 0.8
      coverageScore = 0.8;
      break;
    }
  }

  // find test and src folders
  const [testFolderPath, srcFolderPath] = await Promise.all([ __findTestOrSrc(clonedPath, 'test'),
    __findTestOrSrc(clonedPath, 'src')]);
  if(srcFolderPath === null) { 
    //something MUST be wrong if clonedPath specifies a package repo without a src folder but have CI/CD 
    //files setup
    return 0;
  }
  if(testFolderPath === null) { //has a src folder but no test folder ⇒ coverageScore = 0
    return 0;
  }

  // compute the ratio of test files to source files
  const [numTests, numSrc] = await Promise.all([__countFilesInDirectory(testFolderPath),
     __countFilesInDirectory(srcFolderPath)]);
  // handle if there are more tests than source files
  if(numTests > numSrc) {
    // when there are more tests than source files: first gauge how much more tests 
    // there are than source files ("penalty" for having more tests)
    let penaltyRatio = (numTests - numSrc) / numSrc;
    if(penaltyRatio > 1) { //unreasonably many tests compared to source files
      coverageScore = 0;
    }
    else {
      coverageScore += 0.2 * (1 - penaltyRatio);
    }
  } else {
    coverageScore += 0.2 * numTests / numSrc;
  }

  return coverageScore;
}

/* @param path: string - the path of the repository
*  @returns number - the lint score of the repository
* clone the repo, run the linter, store results to a file,
* parse the results and return the score
* */
function _getLintScore(path: string): number {
  // clone repo with isomorphic-git

  //run linter: and store output to a file
  //parse linter output
  //return score
  return 0;
}
export {calculateCorrectness};