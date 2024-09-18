// this file has all helpers functions that are used in correctness.ts
import axios from 'axios';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config(); // Load environment variables from a .env file into process.env

interface GitHubIssues {
  open_issues_count: number;  // Total number of open issues
  total_issues_count: number // total number of issues opened
  // add more fields if needed
}

/* @param owner: string - the owner of the repository
*  @param repo: string - the repository name
*  @returns boolean - if the repository has a test suite
* 
* a helper function that makes an API call to 
* the GitHub API to check if a repository has a test suite
*/
async function _hasTestSuite(owner: string, repo: string): Promise<boolean> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents`;
  const response = await fetch(url);
  const contents = await response.json();

  if (!Array.isArray(contents)) {
    throw new Error('Failed to fetch repository contents');
  }

  const testDirectories = ['test', 'tests', 'spec', '__tests__'];
  const testFiles = ['package.json'];

  for (const item of contents) {
    if (item.type === 'dir' && testDirectories.includes(item.name)) {
      return true;
    }
    if (item.type === 'file' && testFiles.includes(item.name)) {
      const fileResponse = await fetch(item.download_url);
      const fileContents = await fileResponse.text();
      if (item.name === 'package.json' && fileContents.includes('"test"')) {
        return true;
      }
    }
  }
  return false;
}

/* @param owner: string - the owner of the repository
*  @param repo: string - the repository name
*  @returns GitHubIssues - the total number of issues and open issues
* 
* a helper function that makes an API call to retrieve total number of issues and
* number of open issues for a repository
* */
async function _getIssues(owner: string, repo: string): Promise<GitHubIssues> {
  const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const closedIssuesUrl = `https://api.github.com/search/issues?q=repo:${owner}/${repo}+type:issue+state:closed`;

  try {
    // Make the API call to fetch the repository details
    const [openIssues, totalIssues] = await Promise.all([
      axios.get(repoUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          // add an Authorization header if you have a GitHub token
          'Authorization': `token ${process.env.GITHUB_TOKEN}`
        },
      }),
      axios.get(closedIssuesUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          // add an Authorization header if you have a GitHub token
          'Authorization': `token ${process.env.GITHUB_TOKEN}`
        },
      }),
    ]);
  
    // Extract the total number of issues (both open and closed)
    const result: GitHubIssues = {
      open_issues_count : openIssues.data.open_issues_count,
      total_issues_count : totalIssues.data.total_count
    }

    return result;
  } catch (error) {
    // Handle error and display appropriate message
    console.error('Error fetching issues:', error);
    throw error;
  }
}

/* 
*  @param clonedPath: string - the path of the cloned repository
*  @returns string | null - the path of the test folder or null if not found
* */

// recursive function to find the test folder
// TS recursion to make this method more complete (cover names beyond those in the tuple)
async function __findFolder(clonedPath: string, folderType: string): Promise<string | null> {
  // ONLY use this to find test or src folder pathes and NOTHING ELSE
  async function walkDir(currentPath: string): Promise<string | null> {
    const files = await fs.promises.readdir(currentPath, { withFileTypes: true }); // get a list of files and directories specified by currentPath
    let keywords = (folderType === 'test') ? ['test', 'tests', 'spec', '__tests__'] : ['src', 'lib', 'app', 'main'];
    if(folderType === 'integration') {
      keywords = ['integration'];
    }
    for (const file of files) {
      const fullPath = path.join(currentPath, file.name);
      if (file.isDirectory()) { //only look for keywords in the tuple, can be improved
        if (keywords.includes(file.name)) {
          return fullPath;
        }
        const result = await walkDir(fullPath);
        if (result) { // when result is a valid path with name not in the tuple
          return result;
        }
      }
    }
    return null;
  }
  return walkDir(clonedPath);
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
*  walks the directory tree to find test files, assign scores based on the number of test files
* */
async function _getCoverageScore(clonedPath: string): Promise<number> {
  //assume repo is cloned in /tmp, do a recursive search for test files
  // walk the directory tree to find the test files
  const [testPath, srcPath]: [string | null, string | null] = await Promise.all([
    await __findFolder(clonedPath, 'test'),
    await __findFolder(clonedPath, 'src'),
  ]);

  if(testPath=== null){
    return 0;
  }
  if(srcPath === null) {
    return 0;
  }
  // count number of src files and test files
  const unitTestPath = testPath + '/unit/';
  const integrationPath = testPath + '/integration/';
  
  const [numSrc, numTest, hasIntegration]: [number, number, number] = await Promise.all([
    await __countFilesInDirectory(srcPath),
    fs.existsSync(unitTestPath) ? await __countFilesInDirectory(unitTestPath) : 0,
    fs.existsSync(integrationPath) ? await __countFilesInDirectory(integrationPath) : 0
  ]);
  // compute src to test ratio
  const srcToTestRatio = numTest / numSrc;
  //see if the repo has an integration test suite
  const hasIntegrationTestSuite = hasIntegration > 0 ? 1 : 0;
  //compute coverage score
  const coverageScore = 0.5*srcToTestRatio + 0.5*hasIntegrationTestSuite;
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

export { GitHubIssues, _hasTestSuite, _getIssues, _getCoverageScore, _getLintScore };