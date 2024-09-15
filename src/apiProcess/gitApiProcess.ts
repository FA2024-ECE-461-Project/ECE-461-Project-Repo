//Contains functions to interact with the GitHub API and process the responses
import * as dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import { log } from '../logger';

const GITHUB_API_URL = 'https://api.github.com/repos';

//class for the repository details
export interface RepoDetails {
  owner: string;
  repo: string;
  stars: number;
  issues: number;
  forks: number;
  pullRequests: number;
  license: string;
  discrption: string;
}

// License map
const licenseMap: { [key: string]: string } = {
  "AFL-3.0": "Academic Free License v3.0",
  "Apache-2.0": "Apache License 2.0",
  "Artistic-2.0": "Artistic License 2.0",
  "BSL-1.0": "Boost Software License 1.0",
  "BSD-2-Clause": "BSD 2-clause 'Simplified' License",
  "BSD-3-Clause": "BSD 3-clause 'New' or 'Revised' License",
  "BSD-3-Clause-Clear": "BSD 3-clause Clear License",
  "BSD-4-Clause": "BSD 4-clause 'Original' or 'Old' License",
  "0BSD": "BSD Zero-Clause License",
  "CC0-1.0": "Creative Commons Zero v1.0 Universal",
  "CC-BY-4.0": "Creative Commons Attribution 4.0",
  "CC-BY-SA-4.0": "Creative Commons Attribution ShareAlike 4.0",
  "WTFPL": "Do What The F*ck You Want To Public License",
  "ECL-2.0": "Educational Community License v2.0",
  "EPL-1.0": "Eclipse Public License 1.0",
  "EPL-2.0": "Eclipse Public License 2.0",
  "EUPL-1.1": "European Union Public License 1.1",
  "AGPL-3.0": "GNU Affero General Public License v3.0",
  "GPL-2.0": "GNU General Public License v2.0",
  "GPL-3.0": "GNU General Public License v3.0",
  "LGPL-2.1": "GNU Lesser General Public License v2.1",
  "LGPL-3.0": "GNU Lesser General Public License v3.0",
  "ISC": "ISC License",
  "LPPL-1.3c": "LaTeX Project Public License v1.3c",
  "MS-PL": "Microsoft Public License",
  "MIT": "MIT License",
  "MPL-2.0": "Mozilla Public License 2.0",
  "OSL-3.0": "Open Software License 3.0",
  "PostgreSQL": "PostgreSQL License",
  "OFL-1.1": "SIL Open Font License 1.1",
  "NCSA": "University of Illinois/NCSA Open Source License",
  "Unlicense": "The Unlicense",
  "Zlib": "zLib License"
};

// extract the license from README using regex
function extractLicenseFromReadme(readmeContent: string): string | null {
  // Updated regex to match all listed licenses
  const licenseRegex = new RegExp(
    Object.keys(licenseMap)
      .map(license => `\\b${license}\\b`)
      .join("|"), "i");

  const match = readmeContent.match(licenseRegex);
  if (match) {
    return licenseMap[match[0]] || null; // Return the license name from the map if matched
  }

  return null;
}

// get the GitHub repository details
export async function getGithubInfo(owner: string, repo: string): Promise<RepoDetails> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`
      }
    });

    //get data from github
    const data = response.data;
    const stars = data.stargazers_count;
    const issues = data.open_issues_count;
    const forks = data.forks_count;
    const pullRequests = data.open_pull_requests_count || 0; // Default to 0 if not available
    let license = data.license?.name || 'No license';
    // let license = licenseMap[data.license?.spdx_id] || 'No license';
    const discrption = data.description || 'No description';

    if (license === 'No license' || license === 'Other') {
      const readmeUrl = `${GITHUB_API_URL}/${owner}/${repo}/readme`;
      const readmeResponse = await axios.get(readmeUrl, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      });
      
      //check if the readme file is empty
      if (!readmeResponse.data.content) {
        log.error(`The README file for ${owner}/${repo} is empty`);
      }
      // Decode README content from base64
      const readmeContent = Buffer.from(readmeResponse.data.content, 'base64').toString('utf-8');
      const licenseFromReadme = extractLicenseFromReadme(readmeContent);
      if (licenseFromReadme) {
        license = licenseFromReadme;
      }
    }

    //return the repository details
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
    log.error(`Failed to fetch data for ${owner}/${repo}:`, error);
    throw error;
  }
}
