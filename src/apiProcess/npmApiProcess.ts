//Contains functions to interact with the npm registry, find corresponding GitHub repositories, and process the responses.

import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from a .env file into process.env
import axios from 'axios';
import { log } from '../logger';

const NPM_API_URL = 'https://registry.npmjs.org';

export interface packageInfo {
  license: string;
  description: string;
  numberOfMaintainers: number;
  numberOfContributors: number;

}
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
    log.error(`getGitHubRepoFromNpmUrl: Failed to fetch data for ${packageName}:`, error);
    throw error;
  }
}

export async function getNpmPackageInfo(packageName: string): Promise<packageInfo> {
  try {
    // Fetch package metadata from npm registry
    //log.info(`Fetching data for ${packageName}`);
    const url = `${NPM_API_URL}/${packageName}`;
    const response = await axios.get(url);

    // Extract GitHub repository URL from package metadata
    const packageData = response.data;
    const license = packageData.license || 'No license';
    const description = packageData.description || 'No description';
    const numberOfMaintainers = packageData.maintainers ? packageData.maintainers.length : 0;
    const numberOfContributors = packageData.contributors ? packageData.contributors.length : 0;
    
    const packageInfo: packageInfo = {
      license: license,
      description: description,
      numberOfMaintainers: numberOfMaintainers,
      numberOfContributors: numberOfContributors
    };

    log.info(`Package Info: ${JSON.stringify(packageInfo)}`);
    return packageInfo;

  } catch (error) {
    log.error(`getNpmPackageInfo: Failed to fetch data for ${packageName}:`);
    return {
      license: 'No license',
      description: 'No description',
      numberOfMaintainers: 0,
      numberOfContributors: 0
    };
  }
}

async function getNpmPackageName(owner: string, repo: string): Promise<string | null> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/package.json`;
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/vnd.github.v3.raw'
      }
    });

    const packageJson = response.data;
    const packageData = JSON.parse(packageJson);
    return packageData.name || null;
  } catch (error) {
    log.error(`Failed to fetch package.json for ${owner}/${repo}:`, error);
    return null;
  }
}