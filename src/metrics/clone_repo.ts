// this file has functions that clone a repository from GitHub and remove cloned repos
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'isomorphic-git/http/node';
import * as git from 'isomorphic-git';
import { URL } from 'url';
import { couldStartTrivia } from 'typescript';

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
    const projectDirectory = path.resolve(process.cwd());
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
// Function to escape special characters in a string for use in a regex pattern
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

async function removeRepo(repoPath: string): Promise<Boolean> {
    // Step 1: Normalize the input path
    const normalizedRepoPath = path.normalize(repoPath);
    // Step 2: Resolve the absolute path
    const resolvedRepoPath = path.resolve(normalizedRepoPath);
    const projectDirectory = path.resolve(process.cwd());
    
    // Step 3: Prevent removing anything outside the project directory
    // so that we don't accidentally delete important files like ~,/,...etc
    if (!resolvedRepoPath.startsWith(projectDirectory)) {
        throw new Error('Cannot remove files outside the project directory');
    }
    // Step 4: Prevent removal of the project directory itself
    if (resolvedRepoPath === projectDirectory) {
        throw new Error('Cannot remove the project directory');
    }
    // Step 5: Validate the repository path
    if (!fs.existsSync(resolvedRepoPath)) {
        throw new Error('Repository does not exist');
    }
    // Step 6: Proceed with removal (additional code for removal would go here)
    fs.rm(resolvedRepoPath, { recursive: true }, (err) => { 
      if (err) {
        throw new Error('Error removing the repository');
      }
    });
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

// console.log(path.resolve(path.join(`${process.cwd()}`, '..')));
// const projectDirectory = path.resolve(process.cwd());
// const projectName = path.basename(projectDirectory);

// console.log(projectDirectory);
// console.log(projectName);
// const toRemove = "/home/shay/a/ko109/461/ECE-461-Project-Repo/dummy"
// // const toRemove = "/home/shay/a/ko109/461/ECE-461-Project-Repo";
// removeRepo(toRemove).then((success) => { console.log(`${toRemove} is Removed: ${success}`); });
          
export { cloneRepo , removeRepo };
