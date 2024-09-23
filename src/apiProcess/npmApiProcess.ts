// Contains functions to interact with the npm registry, find corresponding GitHub repositories, and process the responses.

import * as dotenv from "dotenv";
dotenv.config(); // Load environment variables from a .env file into process.env
import axios from "axios";
import { log } from "../logger";

const NPM_API_URL = "https://registry.npmjs.org";

export interface packageInfo {
  license: string;
  description: string;
  numberOfMaintainers: number;
  numberOfContributors: number;
}

/*
  Function Name: getGitHubRepoFromNpmUrl
  Description: This function fetches the GitHub repository URL from the npm registry for a given package.
  @params: 
    - packageName: string - The name of the npm package
  @returns: string - The GitHub repository URL if found, otherwise throws an error.
*/

export async function getGitHubRepoFromNpmUrl(
  packageName: string,
): Promise<string> {
  try {
    log.info(`Fetching GitHub repository URL for package: ${packageName}`);

    // Fetch package metadata from npm registry
    const url = `${NPM_API_URL}/${packageName}`;
    const response = await axios.get(url);
    log.debug(`Received response from npm registry for ${packageName}`);

    // Extract GitHub repository URL from package metadata
    const repositoryUrl = response.data.repository?.url;

    if (repositoryUrl) {
      const sanitizedUrl = repositoryUrl
        .replace("git+", "")
        .replace(".git", "");
      log.info(
        `GitHub repository URL found for ${packageName}: ${sanitizedUrl}`,
      );
      return sanitizedUrl;
    } else {
      console.error(
        `GitHub repository URL not found in package metadata for ${packageName}`,
      );
      process.exit(1);
    }
  } catch (error) {
    console.error(
      `getGitHubRepoFromNpmUrl: Failed to fetch data for ${packageName}:`,
      error,
    );
    process.exit(1);
  }
}

/*
  Function Name: getNpmPackageInfo
  Description: This function fetches npm package metadata such as license, description, maintainers, and contributors.
  @params: 
    - packageName: string - The name of the npm package
  @returns: packageInfo - Object containing package license, description, number of maintainers, and number of contributors.
*/

export async function getNpmPackageInfo(
  packageName: string,
): Promise<packageInfo> {
  try {
    log.info(`Fetching npm package info for ${packageName}`);

    // Fetch package metadata from npm registry
    const url = `${NPM_API_URL}/${packageName}`;
    const response = await axios.get(url);
    log.debug(`Received npm package metadata for ${packageName}`);

    // Extract package metadata
    const packageData = response.data;
    const license = packageData.license || "No license";
    const description = packageData.description || "No description";
    const numberOfMaintainers = packageData.maintainers
      ? packageData.maintainers.length
      : 0;
    const numberOfContributors = packageData.contributors
      ? packageData.contributors.length
      : 0;

    const packageInfo: packageInfo = {
      license: license,
      description: description,
      numberOfMaintainers: numberOfMaintainers,
      numberOfContributors: numberOfContributors,
    };

    log.info(`Successfully fetched package info for ${packageName}`);
    log.debug(`Package Info: ${JSON.stringify(packageInfo)}`);

    return packageInfo;
  } catch (error) {
    log.error(
      `getNpmPackageInfo: Failed to fetch data for ${packageName}:`,
      error,
    );
    return {
      license: "No license",
      description: "No description",
      numberOfMaintainers: 0,
      numberOfContributors: 0,
    };
  }
}
