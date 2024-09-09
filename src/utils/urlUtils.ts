//Contains utility functions for parsing and validating URLs.

import {getGitHubRepoFromNpmUrl} from '../apiProcess/npmApiProcess';
// Enum for URL types
export enum UrlType {
  GitHub = 'GitHub',
  npm = 'npm',
  Invalid = 'Invalid URL'
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

export function convertSshToHttps(sshUrl: string): string | null {
  // Check if the URL is an SSH GitHub URL
  if (sshUrl.startsWith('ssh://git@github.com/')) {
    // Replace the SSH prefix with the HTTPS prefix and remove the optional .git suffix
    return sshUrl.replace(/^ssh:\/\/git@github.com\//, 'https://github.com/').replace(/\.git$/, '');
  }
  // If the URL is not an SSH URL, return it as is
  return sshUrl;
}

export function extractOwnerAndRepo(gitHubUrl: string): RepoInfo {
    const [owner, repo] = gitHubUrl.split('/').slice(-2);
    if (!owner || !repo) {
      throw new Error('Invalid GitHub URL');
    }
    return { owner, repo };
}

export async function processUrl(UrlType: 'github' | 'npm' | 'invalid', url: string): Promise<RepoInfo> {
    if (UrlType === 'invalid') {
      throw new Error('Invalid URL type');
    }
  
    if (UrlType === 'github') {
      return extractOwnerAndRepo(url);
    }
  
    if (UrlType === 'npm') {
      const gitHubUrl = await getGitHubRepoFromNpmUrl(url);
      return extractOwnerAndRepo(gitHubUrl);
    }
  
    throw new Error('Unknown URL type');
  }