import { getGitHubRepoFromNpmUrl } from "../apiProcess/npmApiProcess";
import { log } from "../logger";

// Enum for URL types
export enum UrlType {
  GitHub = "github",
  npm = "npm",
  Invalid = "invalid",
}

// Interface for GitHub repository information
interface RepoInfo {
  owner: string;
  repo: string;
}

/*
  Function Name: checkUrlType
  Description: Determines whether a URL is a GitHub, npm, or invalid URL based on patterns.
  @params: 
    - url: string - The URL to check.
  @returns: UrlType - Returns the type of the URL (GitHub, npm, or Invalid).
*/
export function checkUrlType(url: string): UrlType {
  log.info(`Checking URL type for: ${url}`);

  const githubPattern = /^(https?:\/\/)?(www\.)?github\.com\/[^\/]+\/[^\/]+/;
  const npmPattern = /^(https?:\/\/)?(www\.)?npmjs\.com\/package\/[^\/]+/;

  if (githubPattern.test(url)) {
    log.info(`URL identified as GitHub URL.`);
    return UrlType.GitHub;
  } else if (npmPattern.test(url)) {
    log.info(`URL identified as npm URL.`);
    return UrlType.npm;
  } else {
    log.warn(`Invalid URL type detected.`);
    return UrlType.Invalid;
  }
}

/*
  Function Name: convertSshToHttps
  Description: Converts a GitHub SSH URL to its HTTPS equivalent.
  @params: 
    - sshUrl: string - The SSH URL to convert.
  @returns: string - Returns the HTTPS version of the URL.
*/
export function convertSshToHttps(sshUrl: string): string {
  log.info(`Converting SSH URL to HTTPS: ${sshUrl}`);

  if (
    sshUrl.startsWith("ssh://git@github.com/") ||
    sshUrl.startsWith("git@github.com:")
  ) {
    const httpsUrl = sshUrl
      .replace(/^ssh:\/\/git@github.com\//, "https://github.com/")
      .replace(/^git@github.com:/, "https://github.com/")
      .replace(/\.git$/, "");

    log.info(`Converted SSH URL to HTTPS: ${httpsUrl}`);
    return httpsUrl;
  }

  log.info(`Input URL is not an SSH URL, returning original: ${sshUrl}`);
  return sshUrl;
}

/*
  Function Name: extractOwnerAndRepo
  Description: Extracts the owner and repo name from a GitHub URL.
  @params: 
    - gitHubUrl: string - The GitHub URL.
  @returns: RepoInfo - An object containing the owner and repo.
  @throws: Error if the URL is invalid.
*/
export function extractOwnerAndRepo(gitHubUrl: string): RepoInfo {
  log.info(`Extracting owner and repo from GitHub URL: ${gitHubUrl}`);

  const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
  const match = gitHubUrl.match(regex);

  if (!match || match.length < 3) {
    log.error("Invalid GitHub URL - unable to extract owner and repo.");
    process.exit(1);
  }

  const owner = match[1];
  const repo = match[2];
  log.info(`Extracted owner: ${owner}, repo: ${repo}`);
  return { owner, repo };
}

/*
  Function Name: extractPackageNameFromUrl
  Description: Extracts the npm package name or GitHub repo name from a URL.
  @params: 
    - url: string - The npm or GitHub URL.
  @returns: string - Returns the package or repo name.
  @throws: Error if the URL is invalid.
*/
export function extractPackageNameFromUrl(url: string): string {
  log.info(`Extracting package name from URL: ${url}`);
  const trimmedUrl = url.trim();

  // Regex to match npm package URL
  const npmRegex = /https:\/\/www\.npmjs\.com\/package\/([^\/]+)/;
  const npmMatch = trimmedUrl.match(npmRegex);

  if (npmMatch && npmMatch.length >= 2) {
    log.info(`Extracted npm package name: ${npmMatch[1]}`);
    return npmMatch[1];
  }

  // Regex to match GitHub URL
  const githubRegex = /https:\/\/github\.com\/([^\/]+\/[^\/]+)/;
  const githubMatch = trimmedUrl.match(githubRegex);

  if (githubMatch) {
    const { repo } = extractOwnerAndRepo(url);
    log.info(`Extracted GitHub repo name: ${repo}`);
    return repo;
  }

  console.error("Invalid URL - unable to extract package name.");
  process.exit(1);
}

/*
  Function Name: processUrl
  Description: Processes the provided URL to extract GitHub repository information based on its type.
  @params: 
    - UrlType: "github" | "npm" | "invalid" - The type of the URL.
    - url: string - The URL to process.
  @returns: Promise<RepoInfo> - Returns a promise that resolves to the repository info (owner and repo).
  @throws: Error if the URL type is invalid.
*/
export async function processUrl(
  UrlType: "github" | "npm" | "invalid",
  url: string,
): Promise<RepoInfo> {
  log.info(`Processing URL of type: ${UrlType}, URL: ${url}`);

  if (UrlType === "invalid") {
    log.error("Invalid URL type, cannot process.");
    process.exit(1);
  }

  let owner: string = "";
  let repo: string = "";

  if (UrlType === "npm") {
    log.info("Extracting npm package and corresponding GitHub repo...");
    const packageName = extractPackageNameFromUrl(url);
    const giturl = await getGitHubRepoFromNpmUrl(packageName);
    const httpsUrl = convertSshToHttps(giturl);
    ({ owner, repo } = extractOwnerAndRepo(httpsUrl ?? ""));
  } else if (UrlType === "github") {
    log.info("Processing GitHub URL...");
    ({ owner, repo } = extractOwnerAndRepo(url));
  }

  log.info(`Successfully processed URL. Owner: ${owner}, Repo: ${repo}`);
  return { owner, repo };
}
