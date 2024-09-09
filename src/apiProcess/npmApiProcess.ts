//Contains functions to interact with the npm registry, find corresponding GitHub repositories, and process the responses.

import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from a .env file into process.env
import axios from 'axios';
import { convertSshToHttps } from '../utils/urlUtils';
import { exit } from 'process';

const NPM_API_URL = 'https://registry.npmjs.org/';


export async function getGitHubRepoFromNpmUrl(packageName: string): Promise<string> {
    // Regular expression to extract package name from npm URL

    try {
      // Fetch package metadata from npm registry
      const url = `${NPM_API_URL}/${packageName}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`
        }
      }
      );

      //check for valid GitHub url
      const repositoryUrl = response.data.repository?.url;
      if (!repositoryUrl) {
        console.error('Repository URL not found in package metadata');
        exit(1);
      }
      const gitHubUrl = repositoryUrl.replace(/^git\+/, '').replace(/\.git$/, '');
      console.log(gitHubUrl);
      return gitHubUrl;
    } catch (error) {
      console.error(`Failed to fetch GitHub repository URL: ${error}`);
      exit(1);
    }
  }