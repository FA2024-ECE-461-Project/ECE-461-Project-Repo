// this function clones a GitHub repository to a local directory
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'isomorphic-git/http/node';
import * as git from 'isomorphic-git';
import { URL } from 'url';

async function cloneRepo(githubUrl: string): Promise<string> {
  // Step 1: Validate the GitHub URL
  let repoPath: string;
  try {
    const url = new URL(githubUrl);
    if (url.hostname !== 'github.com') {
      throw new Error('Invalid GitHub URL');
    }
    const [owner, repo] = url.pathname.split('/').filter(Boolean);
    if (!owner || !repo) {
      throw new Error('Invalid GitHub URL');
    }
    repoPath = path.join('/tmp', repo);
  } catch (error) {
    throw new Error('Invalid GitHub URL');
  }

  // Step 2: Clone the repository
  if (!fs.existsSync(repoPath)) {
    fs.mkdirSync(repoPath, { recursive: true });
  }

  await git.clone({
    fs,
    http,
    dir: repoPath,
    url: githubUrl,
    singleBranch: true,
    depth: 1,
  });

  // Step 3: Return the path to the cloned repository
  return repoPath;
}

// Example usage
const githubUrl = 'https://github.com/cloudinary/cloudinary_npm';

cloneRepo(githubUrl).then(repoPath => {
  console.log(`Repository cloned to: ${repoPath}`);
}).catch(error => {
  console.error('Error:', error.message);
});

export { cloneRepo };