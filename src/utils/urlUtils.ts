//Contains utility functions for parsing and validating URLs.

// Enum for URL types
export enum UrlType {
  GitHub = 'GitHub',
  npm = 'npm',
  Invalid = 'Invalid URL'
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
  // Regular expression to match SSH GitHub URLs
  const sshRegex = /^ssh:\/\/git@github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/;
  const match = sshUrl.match(sshRegex);

  if (!match) {
    // If the URL is not an SSH URL, return it as is
    return sshUrl;
  }

  const [_, owner, repo] = match;
  return `https://github.com/${owner}/${repo}`;
}