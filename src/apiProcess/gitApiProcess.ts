//Contains functions to interact with the GitHub API and process the responses

import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from a .env file into process.env
import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com/repos';

//class for the repository details
export interface RepoDetails {
  owner: string;
  repo: string;
  stars: number;
  issues: number;
  forks: number;
  pullRequests: number;
  license: string[];
  discrption: string;
}

// Function to get the GitHub repository details
export async function getGithubInfo(owner: string, repo: string): Promise<RepoDetails> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`
      }
    });

    const data = response.data;
    console.log(`fetching data for ${owner}/${repo}`);
    console.log(`Data: ${JSON.stringify(data)}`);
    const stars = data.stargazers_count;
    const issues = data.open_issues_count;
    const forks = data.forks_count;
    const pullRequests = data.open_pull_requests_count || 0; // Default to 0 if not available
    const license = data.license?.name || 'No license';
<<<<<<< HEAD
   
=======
    const discrption = data.description || 'No description';
>>>>>>> origin/main

    const repoDetails: RepoDetails = {
      owner: owner,
      repo: repo,
      stars: stars,
      issues: issues,
      forks: forks,
      pullRequests: pullRequests,
      license: license,
      discrption: discrption
    };

    return repoDetails;

  } catch (error) {
    console.error(`Failed to fetch data for ${owner}/${repo}:`, error);
    throw error;
  }
}

// Function to get the number of pull requests for a repository
export async function getRepoPullRequests(owner: string, repo: string): Promise<number> {
  try {
    const url = `${GITHUB_API_URL}/${owner}/${repo}/pulls`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`
      }
    });
    return response.data.length;
  } catch (error) {
    console.error(`Failed to fetch data for ${owner}/${repo}:`, error);
    throw error;
  }
}