//Contains functions to interact with the GitHub API and process the responses

import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from a .env file into process.env
import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com/repos';

// Function to get the number of stars for a repository
export async function getRepoStars(owner: string, repo: string): Promise<number> {
  try {
    const url = `${GITHUB_API_URL}/${owner}/${repo}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`
      }
    });
    return response.data.stargazers_count;
  } catch (error) {
    console.error(`Failed to fetch data for ${owner}/${repo}:`, error);
    throw error;
  }
}

// Function to get the number of issues for a repository
export async function getRepoIssues(owner: string, repo: string): Promise<number> {
  try {
    const url = `${GITHUB_API_URL}/${owner}/${repo}/issues`;
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

// Function to get the number of forks for a repository
export async function getRepoForks(owner: string, repo: string): Promise<number> {
  try {
    const url = `${GITHUB_API_URL}/${owner}/${repo}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`
      }
    });
    return response.data.forks_count;
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

