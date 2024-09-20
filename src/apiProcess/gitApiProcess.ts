//Contains functions to interact with the GitHub API and process the responses
import * as dotenv from "dotenv";
dotenv.config(); // Load environment variables from a .env file into process.env
import axios, { all } from "axios";
import { log } from "../logger";
import { exit } from "process";

const GITHUB_API_URL = "https://api.github.com/repos";

if (!process.env.GITHUB_TOKEN) {
  log.error("GITHUB_TOKEN environment variable not set");
  process.exit(1);
}

//class for the repository details
export interface RepoDetails {
  owner: string;
  repo: string;
  created_at: string;
  stars: number;
  openissues: number;
  forks: number;
  license: string;
  descrption: string;
  commitsData: any[];
  issuesData: any[];
  contributorsData: any[];
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
  WTFPL: "Do What The F*ck You Want To Public License",
  "ECL-2.0": "Educational Community License v2.0",
  "EPL-1.0": "Eclipse Public License 1.0",
  "EPL-2.0": "Eclipse Public License 2.0",
  "EUPL-1.1": "European Union Public License 1.1",
  "AGPL-3.0": "GNU Affero General Public License v3.0",
  "GPL-2.0": "GNU General Public License v2.0",
  "GPL-3.0": "GNU General Public License v3.0",
  "LGPL-2.1": "GNU Lesser General Public License v2.1",
  "LGPL-3.0": "GNU Lesser General Public License v3.0",
  ISC: "ISC License",
  "LPPL-1.3c": "LaTeX Project Public License v1.3c",
  "MS-PL": "Microsoft Public License",
  MIT: "MIT License",
  "MPL-2.0": "Mozilla Public License 2.0",
  "OSL-3.0": "Open Software License 3.0",
  PostgreSQL: "PostgreSQL License",
  "OFL-1.1": "SIL Open Font License 1.1",
  NCSA: "University of Illinois/NCSA Open Source License",
  Unlicense: "The Unlicense",
  Zlib: "zLib License",
};

// extract the license from README using regex
function extractLicenseFromReadme(readmeContent: string): string | null {
  // Updated regex to match all listed licenses
  const licenseRegex = new RegExp(
    Object.keys(licenseMap)
      .map((license) => `\\b${license}\\b`)
      .join("|"),
    "i",
  );

  const match = readmeContent.match(licenseRegex);
  if (match) {
    return licenseMap[match[0]] || null; // Return the license name from the map if matched
  }

  return null;
}

async function getLicenseFromPackageJson(
  owner: string,
  repo: string,
): Promise<string | null> {
  try {
    const packageJsonUrl = `${GITHUB_API_URL}/${owner}/${repo}/contents/package.json`;
    const packageResponse = await axios.get(packageJsonUrl, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });

    // Decode package.json content from base64
    if (packageResponse.data.content) {
      const packageContent = Buffer.from(
        packageResponse.data.content,
        "base64",
      ).toString("utf-8");
      const packageJson = JSON.parse(packageContent);

      // Return the license from package.json if it exists
      return packageJson.license || null;
    }
    return null;
  } catch (error) {
    log.error(`Failed to fetch package.json for ${owner}/${repo}:`, error);
    return null;
  }
}

// get the GitHub repository details
export async function getGithubInfo(
  owner: string,
  repo: string,
): Promise<RepoDetails> {
  try {
    const url = `${GITHUB_API_URL}/${owner}/${repo}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });

    //get data from github
    const data = response.data;
    //console.log(data);
    const created_at = data.created_at;
    const stars = data.stargazers_count;
    const forks = data.forks_count;
    const pullRequests = data.open_pull_requests_count || 0; // Default to 0 if not available

    let license = data.license?.name || "No license";
    const descrption = data.description || "No description";
    if (license === "No license" || license === "Other") {
      const licenseFromPackageJson = await getLicenseFromPackageJson(
        owner,
        repo,
      );
      if (licenseFromPackageJson) {
        license = licenseFromPackageJson;
      } else {
        // Fallback to checking the README for license
        const readmeUrl = `${GITHUB_API_URL}/${owner}/${repo}/readme`;
        const readmeResponse = await axios.get(readmeUrl, {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          },
        });

        if (readmeResponse.data.content) {
          const readmeContent = Buffer.from(
            readmeResponse.data.content,
            "base64",
          ).toString("utf-8");
          const licenseFromReadme = extractLicenseFromReadme(readmeContent);
          if (licenseFromReadme) {
            license = licenseFromReadme;
          }
        } else {
          log.error(
            `The README file for ${owner}/${repo} is empty or not found`,
          );
        }
      }
    }

    const currentDate = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(currentDate.getMonth() - 12);
    const startDate =
      created_at > twelveMonthsAgo ? created_at : twelveMonthsAgo;

    const perPage = 100;
    let allCommits: any[] = [];
    let allIssues: any[] = [];

    // Fetch latest 500 commits
    for (let page = 1; page <= 5; page++) {
      // Fetch a page of 100 commits
      const commitsResponse = await axios.get(
        `${GITHUB_API_URL}/${owner}/${repo}/commits`,
        {
          params: {
            per_page: perPage,
            page: page,
            since: startDate,
          },
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          },
        },
      );

      const commits = commitsResponse.data;
      allCommits = allCommits.concat(commits);

      // Check if there are more commits to fetch
      if (
        commits.length < perPage ||
        new Date(commits[commits.length - 1].commit.author.date) < startDate
      ) {
        break;
      }
    }

    // Fetch latest 500 issues
    for (let page = 1; page <= 5; page++) {
      const issuesResponse = await axios.get(
        `${GITHUB_API_URL}/${owner}/${repo}/issues`,
        {
          params: {
            state: "all",
            per_page: perPage,
            page: page,
            since: startDate,
          },
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          },
        },
      );
      const issues = issuesResponse.data;
      allIssues = allIssues.concat(issues);

      // Check if there are more commits to fetch
      if (
        issues.length < perPage ||
        new Date(issues[issues.length - 1].created_at) < startDate
      ) {
        break;
      }
    }

    // Get contributors data
    const contributorsUrl = `${GITHUB_API_URL}/${owner}/${repo}/stats/contributors`;
    const contributorsData = await axios.get(contributorsUrl, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });

    //return the repository details
    const repoDetails: RepoDetails = {
      owner: owner,
      repo: repo,
      created_at: created_at,
      stars: stars,
      openissues: allIssues.length,
      forks: forks,
      license: license,
      descrption: descrption,
      commitsData: allCommits,
      issuesData: allIssues,
      contributorsData: contributorsData.data,
    };

    return repoDetails;
  } catch (error) {
    log.error(`Error: ${error} - Failed to fetch data for ${owner}/${repo}:`);
    console.error(`Error ${error} - Failed to fetch data for ${owner}/${repo}:`);
    process.exit(1);
  }
}
