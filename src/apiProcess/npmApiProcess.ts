//Contains functions to interact with the npm registry, find corresponding GitHub repositories, and process the responses.

import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from a .env file into process.env
import axios from 'axios';

const NPM_API_URL = 'https://registry.npmjs.org/';

export async function getGitHubRepoFromNpmUrl(packageName: string): Promise<string> {
  
    try {
      // Fetch package metadata from npm registry
      const url = `${NPM_API_URL}/${packageName}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`
        }
      }
    );
      const metadata = response.data;
  
      // Extract repository URL from metadata
      const repositoryUrl = metadata.repository?.url;
      if (!repositoryUrl) {
        throw new Error('Repository URL not found in package metadata');
      }
  
      // Convert SSH URL to HTTPS URL if necessary
      // const gitHubUrl = repositoryUrl 
      //   .replace(/^git\+/, '')
      //   .replace(/^ssh:\/\/git@github\.com\//, 'https://github.com/')
      //   .replace(/\.git$/, '');
  
      return repositoryUrl;
    } catch (error) {
      throw error;
    }
}