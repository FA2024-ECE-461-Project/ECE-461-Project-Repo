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
    const stars = data.stargazers_count;
    const issues = data.open_issues_count;
    const forks = data.forks_count;
    const pullRequests = data.open_pull_requests_count || 0; // Default to 0 if not available
    const license = data.license?.name || 'No license';
   
    // const licenseFiles = data.filter((file: any) => file.name.toLowerCase().includes('license'));

    // const licenses: string[] = [];

    // // Fetch and read each license file
    // for (const licenseFile of licenseFiles) {
    //   const licenseUrl = licenseFile.download_url;
    //   const licenseResponse = await axios.get(licenseUrl);
    //   licenses.push(licenseResponse.data);
    // }

    const repoDetails: RepoDetails = {
      owner: owner,
      repo: repo,
      stars: stars,
      issues: issues,
      forks: forks,
      pullRequests: pullRequests,
      license: license
    };

    return repoDetails;

  } catch (error) {
    console.error(`Failed to fetch data for ${owner}/${repo}:`, error);
    throw error;
  }
}

