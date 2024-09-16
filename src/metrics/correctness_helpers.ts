// // // this file has all helpers functions that are used in correctness.ts
// // import axios from 'axios';
// // import * as fs from 'fs';
// // import * as dotenv from 'dotenv';
// // import * as path from 'path';
// // dotenv.config(); // Load environment variables from a .env file into process.env

import { promisify } from 'util';
import { exec } from 'child_process'; //exec spawns a shell and runs a command within that shell
import { cloneRepo, removeRepo } from './clone_repo';

// // const execAsync = promisify(exec); // allowing us to use async/await with exec

// // interface GitHubIssues {
// //   open_issues_count: number;  // Total number of open issues
// //   total_issues_count: number // total number of issues opened
// //   // add more fields if needed
// // }

// // /* @param owner: string - the owner of the repository
// // *  @param repo: string - the repository name
// // *  @returns boolean - if the repository has a test suite
// // * 
// // * a helper function that makes an API call to 
// // * the GitHub API to check if a repository has a test suite
// // */
// // async function _hasTestSuite(owner: string, repo: string): Promise<boolean> {
// //   const url = `https://api.github.com/repos/${owner}/${repo}/contents`;
// //   const response = await fetch(url);
// //   const contents = await response.json();

// //   if (!Array.isArray(contents)) {
// //     throw new Error('Failed to fetch repository contents');
// //   }

// //   const testDirectories = ['test', 'tests', 'spec', '__tests__'];
// //   const testFiles = ['package.json'];

// //   for (const item of contents) {
// //     if (item.type === 'dir' && testDirectories.includes(item.name)) {
// //       return true;
// //     }
// //     if (item.type === 'file' && testFiles.includes(item.name)) {
// //       const fileResponse = await fetch(item.download_url);
// //       const fileContents = await fileResponse.text();
// //       if (item.name === 'package.json' && fileContents.includes('"test"')) {
// //         return true;
// //       }
// //     }
// //   }

// //   return false;
// // }

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
  
// //     // Extract the total number of issues (both open and closed)
// //     const result: GitHubIssues = {
// //       open_issues_count : openIssues.data.open_issues_count,
// //       total_issues_count : totalIssues.data.total_count
// //     }

// //     return result;
// //   } catch (error) {
// //     // Handle error and display appropriate message
// //     console.error('Error fetching issues:', error);
// //     throw error;
// //   }
// // }

/* @param owner: string - the owner of the repository
*  @param repo: string - the repository name
*  @param originalPath: string - the path (location) of where the caller is stored in the repo
*  
* Clones the repository using isomorphic-git, walks the directory tree to find the test files,
* */
async function _getCoverageScore(owner: string, repo: string, originalPath: string) {
  // clone the repository
  const gitHubURL = `https://github.com/${owner}/${repo}`;

  // walk the directory tree to find the test files
  

}

// // /* @param path: string - the path of the repository
// // *  @returns number - the lint score of the repository
// // * clone the repo, run the linter, store results to a file,
// // * parse the results and return the score
// // * */
// // function _getLintScore(path: string): number {
// //   // clone repo with isomorphic-git

// //   //run linter: and store output to a file
// //   //parse linter output
// //   //return score
// //   return 0;
// // }

// // export { GitHubIssues, _hasTestSuite, _getIssues, _getCoverageScore, _getLintScore };
// import axios from 'axios';
// import * as fs from 'fs';
// import * as dotenv from 'dotenv';
// import * as path from 'path';
// dotenv.config(); // Load environment variables from a .env file into process.env

// import { promisify } from 'util';
// import { exec } from 'child_process'; //exec spawns a shell and runs a command within that shell
// import * as igit from 'isomorphic-git';
// import http from 'isomorphic-git/http/node';

// const execAsync = promisify(exec); // allowing us to use async/await with exec

// interface GitHubIssues {
//   open_issues_count: number;  // Total number of open issues
//   total_issues_count: number; // Total number of issues opened
// }

// /**
//  * Checks if the repository has a test suite.
//  * 
//  * @param owner - Owner of the repository
//  * @param repo - Repository name
//  * @returns boolean - Whether the repository has a test suite
//  */
// async function _hasTestSuite(owner: string, repo: string): Promise<boolean> {
//   const url = `https://api.github.com/repos/${owner}/${repo}/contents`;
//   const response = await fetch(url);
//   const contents = await response.json();

//   if (!Array.isArray(contents)) {
//     throw new Error('Failed to fetch repository contents');
//   }

//   const testDirectories = ['test', 'tests', 'spec', '__tests__'];
//   const testFiles = ['package.json'];

//   for (const item of contents) {
//     if (item.type === 'dir' && testDirectories.includes(item.name)) {
//       return true;
//     }
//     if (item.type === 'file' && testFiles.includes(item.name)) {
//       const fileResponse = await fetch(item.download_url);
//       const fileContents = await fileResponse.text();
//       if (item.name === 'package.json' && fileContents.includes('"test"')) {
//         return true;
//       }
//     }
//   }

//   return false;
// }

// /**
//  * Retrieves total number of issues and number of open issues for a repository.
//  * 
//  * @param owner - Owner of the repository
//  * @param repo - Repository name
//  * @returns GitHubIssues - Total and open issue counts
//  */
// async function _getIssues(owner: string, repo: string): Promise<GitHubIssues> {
//   const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
//   const closedIssuesUrl = `https://api.github.com/search/issues?q=repo:${owner}/${repo}+type:issue+state:closed`;

//   try {
//     // Make the API call to fetch the repository details
//     const [openIssues, totalIssues] = await Promise.all([
//       axios.get(repoUrl, {
//         headers: {
//           'Accept': 'application/vnd.github.v3+json',
//           'Authorization': `token ${process.env.GITHUB_TOKEN}`
//         },
//       }),
//       axios.get(closedIssuesUrl, {
//         headers: {
//           'Accept': 'application/vnd.github.v3+json',
//           'Authorization': `token ${process.env.GITHUB_TOKEN}`
//         },
//       }),
//     ]);

//     // Extract the total number of issues (both open and closed)
//     const result: GitHubIssues = {
//       open_issues_count: openIssues.data.open_issues_count,
//       total_issues_count: totalIssues.data.total_count + openIssues.data.open_issues_count,
//     };

//     return result;
//   } catch (error) {
//     // Handle error and display appropriate message
//     console.error('Error fetching issues:', error);
//     throw error;
//   }
// }

// /**
//  * Clones the repository using isomorphic-git, runs the tests, and returns the test coverage score.
//  * 
//  * @param owner - Owner of the repository
//  * @param repo - Repository name
//  * @param originalPath - Path where the caller is stored in the repo
//  * @returns Test coverage score as a number
//  */
// async function _getCoverageScore(owner: string, repo: string, originalPath: string) {
//   const repoUrl = `https://github.com/${owner}/${repo}.git`;
//   const repoDir = path.join('/tmp', repo);

//   // Step 1: Clone the repository using isomorphic-git
//   await igit.clone({
//     fs,
//     http,
//     dir: repoDir,
//     url: repoUrl,
//     singleBranch: true,
//     depth: 1, // Shallow clone
//   });

//   // Step 2: Change working directory to the cloned repository
//   process.chdir(repoDir);

//   // Step 3: Install dependencies
//   await execAsync('npm install');

//   // Step 4: Run tests and generate coverage report
//   await execAsync('npx jest --coverage'); // Assuming Jest is used for testing

//   // Step 5: Parse the coverage report
//   const coverageReportPath = path.join(repoDir, 'coverage', 'lcov-report', 'index.html');
//   const coverageReport = fs.readFileSync(coverageReportPath, 'utf-8');
//   const coverageMatch = coverageReport.match(/<span class="strong">All files<\/span>[\s\S]*?<span class="strong">([\d.]+)%<\/span>/);

//   if (!coverageMatch) {
//     // Change back to original directory
//     process.chdir(originalPath);
//     throw new Error('Failed to parse coverage report');
//   }

//   const coverageScore = parseFloat(coverageMatch[1]);

//   // Change back to original directory
//   process.chdir(originalPath);

//   // Step 6: Return the coverage score
//   return coverageScore;
// }

// /**
//  * Placeholder for running the linter, storing results to a file, and returning the lint score.
//  * 
//  * @param path - Path of the repository
//  * @returns Lint score as a number
//  */
// function _getLintScore(path: string): number {
//   // Placeholder for cloning repo with isomorphic-git
//   // Placeholder for running linter and storing output
//   // Placeholder for parsing linter output and returning score

//   return 0; // Placeholder return, modify when logic is implemented
// }

// // Export functions to be used in other files
// export { GitHubIssues, _hasTestSuite, _getIssues, _getCoverageScore, _getLintScore };
