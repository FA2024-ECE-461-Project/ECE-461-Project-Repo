// this file has all helpers functions that are used in correctness.ts
import axios from 'axios';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';
import ts from 'typescript';
dotenv.config(); // Load environment variables from a .env file into process.env

/* @param owner: string - the owner of the repository
*  @param repo: string - the repository name
*  @returns boolean - if the repository has a test suite
* 
* a helper function that makes an API call to 
* the GitHub API to check if a repository has a test suite
*/
async function _hasTestSuite(owner: string, repo: string): Promise<boolean> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents`;
  const response = await fetch(url);
  const contents = await response.json();

  if (!Array.isArray(contents)) {
    throw new Error('Failed to fetch repository contents');
  }

  const testDirectories = ['test', 'tests', 'spec', '__tests__'];
  const testFiles = ['package.json'];

  for (const item of contents) {
    if (item.type === 'dir' && testDirectories.includes(item.name)) {
      return true;
    }
    if (item.type === 'file' && testFiles.includes(item.name)) {
      const fileResponse = await fetch(item.download_url);
      const fileContents = await fileResponse.text();
      if (item.name === 'package.json' && fileContents.includes('"test"')) {
        return true;
      }
    }
  }
  return false;
}


/* 
*  @param clonedPath: string - the path of the cloned repository
*  @returns string | null - the path of the test folder or null if not found
* */

async function __findFolder(directoryPath: string, targetFolderName: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        return reject(err);
      }
      // scan the directory for the target folder
      for (const file of files) {
        if (file.isDirectory() && file.name === targetFolderName) {
          return resolve(path.join(directoryPath, file.name));
        }
      }
      resolve(null);  //return null if target folder is not found
    });
  });
}

async function __countFilesInDirectory(dirPath: string, count: number = 0): Promise<number> {
  // DO NOT "shell out": instead use the path or fs module to do file traversal
  if(fs.existsSync(dirPath)) {
    const filesList = await fs.promises.readdir(dirPath, { withFileTypes: true }); // use readdir (an async method) to prevent blocking event loop
    for(const file of filesList) {
      if(file.isDirectory()) { // if file is a directory, descent into it with recursion and update count
        const subdirPath = path.join(dirPath, file.name);
        count = await __countFilesInDirectory(subdirPath, count);
      } else {
        count++;
      }
    }
  }
  return count;
}

/* @param clonedPath: string - the path of the cloned repository
*  @returns number - the coverage score of the repository
*  walks the directory tree to find test files, assign scores based on the number of test files
* */
async function _getCoverageScore(clonedPath: string): Promise<number> {
  //assume repo is cloned in /tmp, do a recursive search for test files
  // walk the directory tree to find the test files
  const [testPath, srcPath]: [string | null, string | null] = await Promise.all([
    await __findFolder(clonedPath, 'test'),
    await __findFolder(clonedPath, 'src'),
  ]);

  if(testPath=== null){
    return 0;
  }
  if(srcPath === null) {
    return 0;
  }
  // count number of src files and test files
  const unitTestPath = testPath + '/unit/';
  const integrationPath = testPath + '/integration/';
  
  const [numSrc, numTest]: [number, number] = await Promise.all([
    await __countFilesInDirectory(srcPath),
    fs.existsSync(unitTestPath) ? await __countFilesInDirectory(unitTestPath) : await __countFilesInDirectory(testPath),
  ]);
  // compute src to test ratio (restrict this to [0,1]): if more test than src, automatically set to 1
  const testToSrcRatio = Math.min(numTest/numSrc, 1);

  //see if the repo has an integration test suite
  const hasIntegrationTestSuite = fs.existsSync(integrationPath) ? 1 : 0;
  //compute coverage score
  const coverageScore = 0.5*testToSrcRatio + 0.5*hasIntegrationTestSuite;
  return coverageScore;
}

/* @param path: string - the path of the repository
*  @returns number - the lint score of the repository
* clone the repo, run the linter, store results to a file,
* parse the results and return the score
* */
function _getLintScore(path: string): number {
  // clone repo with isomorphic-git

  //run linter: and store output to a file
  //parse linter output
  //return score
  return 0;
}

export { _hasTestSuite, _getCoverageScore, _getLintScore };