import {getGitHubRepoFromNpmUrl} from '../apiProcess/npmApiProcess';
// Enum for URL types
export enum UrlType {
  GitHub = 'github',
  npm = 'npm',
  Invalid = 'invalid'
}

//github repo info
interface RepoInfo {
    owner: string;
    repo: string;
  }

// Function to determine if the link is a GitHub, npm, or invalid URL
export function checkUrlType(url: string): UrlType {
  const githubPattern = /^(https?:\/\/)?(www\.)?github\.com\/[^\/]+\/[^\/]+/;
  const npmPattern = /^(https?:\/\/)?(www\.)?npmjs\.com\/package\/[^\/]+/;
  

  if (githubPattern.test(url)) {
    return UrlType.GitHub;
  } else if (npmPattern.test(url)) {
    return UrlType.npm;
  } else {
    return UrlType.Invalid;
  }
}

export function convertSshToHttps(sshUrl: string): string {
  // Check if the URL is an SSH GitHub URL
  if (sshUrl.startsWith('ssh://git@github.com/') || sshUrl.startsWith('git@github.com:')) {
    // Replace the SSH prefix with the HTTPS prefix and remove the optional .git suffix
    return sshUrl.replace(/^ssh:\/\/git@github.com\//, 'https://github.com/')
                 .replace(/^git@github.com:/, 'https://github.com/')
                 .replace(/\.git$/, '');
  }
  // If the URL is not an SSH URL, return input URL
  return sshUrl;
}

export function extractOwnerAndRepo(gitHubUrl: string): RepoInfo {
  const [owner, repo] = gitHubUrl.split('/').slice(-2); //split url using '/' as delimiter and extract the last 2 elements
  if (!owner || !repo) {
    throw new Error('Invalid GitHub URL');
  }
  return { owner, repo };
}

export function extractPackageNameFromUrl(url: string): string {
  const trimmedUrl = url.trim(); // Trim any leading or trailing whitespace

  // Regex to match npm package URL
  const npmRegex = /https:\/\/www\.npmjs\.com\/package\/([^\/]+)/;
  const npmMatch = trimmedUrl.match(npmRegex);

  if (npmMatch && npmMatch.length >= 2) {
    return npmMatch[1]; // Return the package name
  }

  // Regex to match GitHub URL
  const githubRegex = /https:\/\/github\.com\/([^\/]+\/[^\/]+)/;
  const githubMatch = trimmedUrl.match(githubRegex);

  if (githubMatch) {
    const {owner, repo} = extractOwnerAndRepo(url);
    return  repo;// Return the GitHub RepoName
  }

  throw new Error('Invalid URL');
}

export async function processUrl(UrlType: 'github' | 'npm' | 'invalid', url: string): Promise<RepoInfo> {
  if (UrlType === 'invalid') {
    throw new Error('Invalid URL type');
  }

  let owner: string = '';
  let repo: string = '';

  if (UrlType === 'npm') {
    const packageName = extractPackageNameFromUrl(url);
    const giturl = await getGitHubRepoFromNpmUrl(packageName);
    const httpsUrl = convertSshToHttps(giturl);
    ({ owner, repo } = extractOwnerAndRepo(httpsUrl ?? ""));
  } else if (UrlType === 'github') {
    ({ owner, repo } = extractOwnerAndRepo(url));
  }

  return { owner, repo };
}