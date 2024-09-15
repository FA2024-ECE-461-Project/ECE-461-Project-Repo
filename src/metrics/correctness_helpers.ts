// this file has all helpers functions that are used in correctness.ts
import axios from 'axios';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config(); // Load environment variables from a .env file into process.env

import { promisify } from 'util';
import { exec } from 'child_process'; //exec spawns a shell and runs a command within that shell

const execAsync = promisify(exec); // allowing us to use async/await with exec

interface GitHubIssues {
  open_issues_count: number;  // Total number of open issues
  total_issues_count: number // total number of issues opened
  // add more fields if needed
}

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
    ]

    )
  
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

async function _getCoverageScore(owner: string, repo: string, originalPath: string) {
  //clone repo: may assume this repo has a test suite
  const repoUrl = `https://github.com/${owner}/${repo}.git`;
  const repoDir = path.join('/tmp', repo);

  // Step 1: Clone the repository
  await execAsync(`git clone ${repoUrl} ${repoDir}`);

  //Step 2. run tests
  // Change working directory to the cloned repository
  process.chdir(repoDir);

  // Step 3: Install dependencies
  await execAsync('npm install');

  // Step 4: Run tests and generate coverage report
  await execAsync('npx jest --coverage'); // Assuming Jest is used for testing

  // Step 5: Parse the coverage report
  const coverageReportPath = path.join(repoDir, 'coverage', 'lcov-report', 'index.html');
  const coverageReport = fs.readFileSync(coverageReportPath, 'utf-8');
  const coverageMatch = coverageReport.match(/<span class="strong">All files<\/span>[\s\S]*?<span class="strong">([\d.]+)%<\/span>/);

  if (!coverageMatch) {
    // Change back to original directory
    process.chdir(originalPath);
    throw new Error('Failed to parse coverage report');
  }

  const coverageScore = parseFloat(coverageMatch[1]);

  // Change back to original directory
  process.chdir(originalPath);

  // Step 6: Return the coverage score
  return coverageScore;
}

function _getLintScore(path: string){
  //run linter: and store output to a file
  //parse linter output
  //return score
}

export { GitHubIssues, _hasTestSuite, _getIssues, _getCoverageScore, _getLintScore };