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
    const cwd = process.cwd(); // current working directory
    repoPath = path.join(`${cwd}/`, repo);  // aim to clone to current working directory
    // on success, should get a cloned repo folder in the current working directory
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
    // sanity checks on input, don't wanna delete important directories
    // Step 1: Normalize the repository path
    const normalizedRepoPath = path.resolve(repoPath);
    // Step 2: Get the current project directory
    const currentProjectDir = path.resolve(__dirname);
    // Step 3: Define critical directories
    const criticalDirs = [
        path.resolve('/'),
        path.resolve(process.env.HOME || '~'),
        currentProjectDir,
    ];
    // Step 4: Check if the path is a critical directory
    if (criticalDirs.includes(normalizedRepoPath)) {
        throw new Error('Attempt to remove a critical directory');
    }
    // Step 5: Validate the repository path
    if (!fs.existsSync(normalizedRepoPath)) {
        throw new Error('Repository does not exist');
    }
    // Step 6: Remove the repository
    await exec(`rm -rf ${repoPath}`);
    // Step 7: Return true to indicate success
    return true;
}


// Example usage
// const githubUrl = 'https://github.com/cloudinary/cloudinary_npm';
// cloneRepo(githubUrl).then((repoPath) => {
//   console.log(`Cloned to: ${repoPath}`);
//   removeRepo(repoPath).then((success) => {
//     console.log(`Removed: ${success}`);
//   });
// });

export { cloneRepo , removeRepo };
