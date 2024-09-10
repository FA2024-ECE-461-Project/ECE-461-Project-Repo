//Contains functions to interact with the npm registry, find corresponding GitHub repositories, and process the responses.

import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from a .env file into process.env
import axios from 'axios';

const NPM_API_URL = 'https://registry.npmjs.org';

export async function getGitHubRepoFromNpmUrl(packageName: string): Promise<string> {
  try {
    // Fetch package metadata from npm registry
    const url = `${NPM_API_URL}/${packageName}`;
    const response = await axios.get(url);

    // Extract GitHub repository URL from package metadata
    const repositoryUrl = response.data.repository?.url;

    if (repositoryUrl) {
      // Return the GitHub repository URL
      return repositoryUrl.replace('git+', '').replace('.git', '');
    } else {
      throw new Error('GitHub repository URL not found in package metadata');
    }
  } catch (error) {
    console.error(`Failed to fetch data for ${packageName}:`, error);
    throw error;
  }
}