//calculate correctness
import axios from "axios";
import * as fs from "fs";
import { RepoDetails } from "../apiProcess/gitApiProcess";
import * as path from "path";
import * as dotenv from "dotenv";
import { log } from "../logger";
dotenv.config(); // Load environment variables from a .env file into process.env

/* @param metric: RepoDetails - the returned output from getGitRepoDetails
 *  @returns score between 0 and 1 evaluated from
 *  - test coverage score
 *  - static analysis score
 *  - issue ratio
 */
async function calculateCorrectness(
  metric: RepoDetails,
  clonedPath: string,
): Promise<number> {
  if (!fs.existsSync(clonedPath)) {
    throw new Error("Cloned path does not exist");
  }

  // dynamic analysis: compute test coverage score
  const testCoverageScore = await _getCoverageScore(clonedPath);

  // compute static analysis score: wait for later

  // compute issue ratio
  const openToClosedIssueRatio = _computeOpenToClosedIssueRatio(metric);
  log.info(
    `${metric.repo} - testCoverageScore: ${testCoverageScore}, openToClosedIssueRatio: ${openToClosedIssueRatio}`,
  );
  return 0.5 * testCoverageScore + 0.5 * openToClosedIssueRatio;
}

//helpers
function _computeOpenToClosedIssueRatio(metric: RepoDetails): number {
  // Check if there are any commits available
  // Setting default Values
  let ratioClosedToOpenIssues = 0;

  // get date for 6 months ago
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // get current date
  const currentDate = new Date();
  // constant value to convert time difference to weeks
  if (metric.issuesData.length == 0) {
    return 0;
  }

  // Determine the start date for the 6-month period (or less if not enough data)
  const dateEarliestIssue = new Date(
    metric.issuesData[metric.issuesData.length - 1].created_at,
  );

  const startDateIssues =
    dateEarliestIssue > sixMonthsAgo ? dateEarliestIssue : sixMonthsAgo;

  // Calculate = number of issues closed in the past 6 months that were opened
  //             in the past 6 months / number of issues created in the past 6 months
  const issues = metric.issuesData;
  const issuesOpenedPast6Months = issues.filter(
    (issue) => new Date(issue.created_at) >= startDateIssues,
  );
  const closedIssuesPast6Months = issuesOpenedPast6Months.filter(
    (issue) => issue.state === "closed",
  );

  if (
    !(
      issuesOpenedPast6Months.length == 0 || closedIssuesPast6Months.length == 0
    )
  ) {
    // Calculate avg week to close an issue
    ratioClosedToOpenIssues =
      closedIssuesPast6Months.length / issuesOpenedPast6Months.length;
    const millisecondsInAWeek = 1000 * 60 * 60 * 24 * 7;
  }
  return ratioClosedToOpenIssues;
}

/*  Searching the entire repo in BFS manner for the test and src folders
 *  @param directoryPath: string - the path of the directory to search
 *  @param targetFolderName: string - the name of the folder to search for
 *  @param maxDepth: number - the maximum depth to search for the folder: defalut to 2
 *  @returns string | null - the path of the test folder or null if not found
 * */
async function __findSrc(
  directoryPath: string,
  maxDepth: number = 2,
): Promise<string | null> {
  if (!fs.existsSync(directoryPath)) {
    return null;
  }
  // BFS for the src folder
  const srcPattern = /^(src|source|sources|lib|app|package|packages|main)$/;
  const queue: { path: string; depth: number }[] = [
    { path: directoryPath, depth: 0 },
  ];

  while (queue.length > 0) {
    //deconstructing assignment that inits currentPath and currentDepth to the first element in the queue
    const { path: currentPath, depth: currentDepth } = queue.shift()!;
    const namesInFolder = await fs.promises.readdir(currentPath, {
      withFileTypes: true,
    });

    for (const folder of namesInFolder) {
      if (folder.isDirectory()) {
        if (srcPattern.test(folder.name)) {
          const completePath = path.join(currentPath, folder.name);
          log.info(`In _findSrc, found source in ${completePath}`);
          return completePath;
        }
        if (currentDepth < maxDepth) {
          // enqueue current folder and assign depth for further search
          queue.push({
            path: path.join(currentPath, folder.name),
            depth: currentDepth + 1,
          });
        }
      }
    }
  }

  return null;
}

async function __findTest(
  directoryPath: string,
  maxDepth: number = 2,
): Promise<string | null> {
  const testPattern = /^(test|tests|spec|__tests__|__test__)$/;
  const queue: { path: string; depth: number }[] = [
    { path: directoryPath, depth: 0 },
  ];

  while (queue.length > 0) {
    const { path: currentPath, depth: currentDepth } = queue.shift()!;
    const namesInFolder = await fs.promises.readdir(currentPath, {
      withFileTypes: true,
    });

    for (const folder of namesInFolder) {
      if (folder.isDirectory()) {
        if (testPattern.test(folder.name)) {
          const completePath = path.join(currentPath, folder.name);
          log.info(`In __findTest, found test in ${completePath}`);
          return completePath;
        } else if (currentDepth < maxDepth) {
          // enqueue current folder and assign depth for further search
          queue.push({
            path: path.join(currentPath, folder.name),
            depth: currentDepth + 1,
          });
        }
      }
    }
  }
  return null;
}

async function __countFilesInDirectory(
  dirPath: string,
  count: number = 0,
): Promise<number> {
  // DO NOT "shell out": instead use the path or fs module to do file traversal
  if (fs.existsSync(dirPath)) {
    const filesList = await fs.promises.readdir(dirPath, {
      withFileTypes: true,
    }); // use readdir (an async method) to prevent blocking event loop
    for (const file of filesList) {
      if (file.isDirectory()) {
        // if file is a directory, descent into it with recursion and update count
        const subdirPath = path.join(dirPath, file.name);
        count = await __countFilesInDirectory(subdirPath, count);
      } else {
        count++;
      }
    }
  }
  return count;
}

async function _getCIFilesScore(clonedPath: string): Promise<number> {
  const ciFilesPattern =
    /^(.travis.yml|circle.yml|Jenkinsfile|azure-pipelines.yml|ci(-[a-z])*.yml)$/;

  async function searchDirectory(directory: string): Promise<number> {
    const filesInRepo = await fs.promises.readdir(directory, {
      withFileTypes: true,
    });
    for (const file of filesInRepo) {
      const fullPath = path.join(directory, file.name);
      if (file.isDirectory()) {
        const score = await searchDirectory(fullPath);
        if (score === 0.8) {
          return 0.8; // Return immediately if a CI/CD file is found
        }
      } else if (ciFilesPattern.test(file.name)) {
        return 0.8; // Return 0.8 if a CI/CD file is found
      }
    }
    return 0; // Return 0 if no CI/CD files are found in this directory
  }

  return await searchDirectory(clonedPath);
}

/* @param clonedPath: string - the path of the cloned repository
 *  @returns number - the coverage score of the repository
 *  compute coverageScore specified by clonedPath based on the following criteria:
 * - presence of CI/CD configuration files
 * - ratio of test files to source files
 * formula(s) for calculation will differ based on the file structure of the repository, but must
 * ensure the coverageScore is between 0 and 1.
 * */
async function _getCoverageScore(clonedPath: string): Promise<number> {
  // Check for CI/CD configuration files
  let ciCdScore = await _getCIFilesScore(clonedPath); // should get 0 or 0.8
  log.info(`CI/CD configuration file score: ${ciCdScore}`);
  // find test and src folders
  const [testFolderPath, srcFolderPath] = await Promise.all([
    __findTest(clonedPath),
    __findSrc(clonedPath),
  ]);
  if (srcFolderPath === null) {
    //something MUST be wrong if clonedPath specifies a package repo without a src folder but have CI/CD
    //files setup
    log.error(`No src folder found in ${clonedPath}`);
    return 0;
  }
  if (testFolderPath === null) {
    //has a src folder but no test folder ⇒ coverageScore = 0
    log.error(`No test folder found in ${clonedPath}`);
    return 0;
  }
  // compute the ratio of test files to source files
  const [numTests, numSrc] = await Promise.all([
    __countFilesInDirectory(testFolderPath),
    __countFilesInDirectory(srcFolderPath),
  ]);

  let repoScore = 0;
  // handle if there are more tests than source files
  if (numTests > numSrc) {
    // when there are more tests than source files: first gauge how much more tests  there are than source files
    // then compute "penalty" for having more tests
    let penaltyRatio = (numTests - numSrc) / numSrc;
    if (penaltyRatio > 1) {
      //unreasonably many tests compared to source files
      repoScore = 0;
    } else {
      repoScore += 0.2 * (1 - penaltyRatio);
    }
  } else {
    repoScore += 0.2 * (numTests / numSrc);
  }

  // final coverage score calculation
  let coverageScore = 0;
  if (ciCdScore === 0.8) {
    // if trhere are CI/CD configuration files
    coverageScore = ciCdScore + repoScore;
  } else {
    // use the entire (not weighted) repoScore as the coverage score
    coverageScore = repoScore / 0.2;
  }
  return coverageScore;
}

export { calculateCorrectness };
