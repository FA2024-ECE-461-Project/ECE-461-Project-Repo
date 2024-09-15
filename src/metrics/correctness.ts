//calculate correctness
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from a .env file into process.env

import {RepoDetails} from '../apiProcess/gitApiProcess';

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

async function calculateCorrectness(owner: string, repo: string): Promise<number> {
  //fetch all information needed (add onto it if needed)
  const [issueInfo, hasTestSuite]: [GitHubIssues, Boolean] = await Promise.all([
    _getIssues(owner, repo),
    _hasTestSuite(owner, repo)
  ]);

  // compute test coverage score: dynamic analysis
  // I am assuming all tests are created with jest
  let testCoverageScore = 0;
  if(hasTestSuite){
    // run test locally using jset to see coverage
    
    //set testCoverageScore to it
  }

  // compute static analysis score

  // compute issue ratio
  const issueRatio = issueInfo.open_issues_count / issueInfo.total_issues_count;
  return 0.5 * testCoverageScore + 0.25 * issueRatio;
}

export{calculateCorrectness};