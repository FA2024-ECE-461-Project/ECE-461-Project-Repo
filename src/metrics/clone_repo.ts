// this file has functions that clone a repository from GitHub and remove cloned repos
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'isomorphic-git/http/node';
import * as git from 'isomorphic-git';
import { URL } from 'url';
import { exec } from 'child_process'; // for cloning remote repos to do anaylsis

/*
    * Clone a GitHub repository to the local filesystem
    * @param githubUrl: string - The URL of the GitHub repository to clone
    * @returns: string The path to the cloned repository
    * 
    * This function works on eceprog, but not sure on other maches, may need to fix later
*/
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

/*
    * Remove a cloned repository from the local filesystem
    * @param repoPath: string - The path to the cloned repository
    * @returns: boolean - Indicates whether the repository was successfully removed
    * if the repository does not exist, throw an error
*/
async function removeRepo(repoPath: string): Promise<Boolean> {
    // Step 1: Validate the repository path
    if (!fs.existsSync(repoPath)) {
        throw new Error('Repository does not exist');
    }
    
    // Step 2: Remove the repository
    await exec(`rm -rf ${repoPath}`);
    // Step 3: Return true to indicate success
    return true;
}


// Example usage
const githubUrl = 'https://github.com/cloudinary/cloudinary_npm';

cloneRepo(githubUrl).then(repoPath => {
  console.log(`Repository cloned to: ${repoPath}`);
}).catch(error => {
  console.error('Error:', error.message);
});

export { cloneRepo , removeRepo };