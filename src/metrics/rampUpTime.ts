import { RepoDetails } from "../apiProcess/gitApiProcess";
import * as fs from "fs";
import * as path from "path";
import { log } from "../logger";

/*
  Function Name: calculateRampUpTime
  Description: This function calculates the ramp-up time score of a repository based on the presence of a README, 
               installation instructions, and the code-to-comment ratio.
  @params: 
    - metrics: RepoDetails - The repository details used for scoring
    - dir: string - The directory where the repository is located
  @returns: number - The calculated ramp-up time score.
*/
export async function calculateRampUpTime(
  metrics: RepoDetails,
  dir: string,
): Promise<number> {
  try {
    log.info(`Starting ramp-up time calculation for directory: ${dir}`);
    let score = 0;

    // Check for README file
    const readmeScore = checkReadme(dir) ? 0.1 : 0;
    log.debug(`README file score: ${readmeScore}`); // Log the README score
    score += readmeScore;

    // Check for installation instructions
    const installScore = checkInstallationInstructions(dir) ? 0.4 : 0;
    log.debug(`Installation instruction score: ${installScore}`); // Log the installation instructions score
    score += installScore;

    // Calculate code-to-comment ratio
    const codeCommentRatioScore = calculateCodeCommentRatio(dir);
    log.debug(`Code-to-comment ratio score: ${codeCommentRatioScore}`); // Log the code-to-comment ratio score
    score += codeCommentRatioScore;

    log.info(`Final ramp-up time score: ${score}`);
    return score;
  } catch (error) {
    log.error("Error calculating ramp-up time:", error);
    return 0;
  }
}

/*
  Function Name: checkReadme
  Description: Checks whether the README file exists in the given directory.
  @params: 
    - dir: string - The directory to search for a README file.
  @returns: boolean - True if a README file is found, false otherwise.
*/
export function checkReadme(dir: string): boolean {
  log.info(`Checking for README file in directory: ${dir}`);
  const files = fs.readdirSync(dir);
  log.debug(`Files found: ${files}`); // Log all files in the directory
  const readmeFiles = files.filter((file) =>
    /^README(\.md|\.txt)?$/i.test(file),
  );
  log.debug(`README files found: ${readmeFiles.length}`); // Log the number of README files found
  return readmeFiles.length > 0;
}

/*
  Function Name: checkInstallationInstructions
  Description: Checks for installation instructions in README files in the given directory.
  @params: 
    - dir: string - The directory to search for README files.
  @returns: boolean - True if installation instructions are found, false otherwise.
*/
export function checkInstallationInstructions(dir: string): boolean {
  log.info(
    `Checking for installation instructions in README files in directory: ${dir}`,
  );
  const files = fs.readdirSync(dir);
  const readmeFiles = files.filter((file) =>
    /^README(\.md|\.txt)?$/i.test(file),
  );
  log.debug(`README files found for installation check: ${readmeFiles.length}`);

  const keywords = ["install", "test", "launch", "run", "example"];

  for (const readmeFile of readmeFiles) {
    const content = fs
      .readFileSync(path.join(dir, readmeFile), "utf8")
      .toLowerCase();
    log.debug(`Checking README content for keywords: ${content}`);
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        log.debug(`Installation instructions found with keyword: ${keyword}`);
        return true;
      }
    }
  }
  log.debug("No installation instructions found.");
  return false;
}

/*
  Function Name: calculateCodeCommentRatio
  Description: Calculates the code-to-comment ratio score for the given directory.
  @params: 
    - dir: string - The directory to search for code files.
  @returns: number - The calculated code-to-comment ratio score.
*/
export function calculateCodeCommentRatio(dir: string): number {
  log.info("Calculating code-to-comment ratio score...");
  const allFiles = getAllFiles(dir);
  log.debug(
    `Files found in directory for comment ratio calculation: ${allFiles}`,
  );

  const codeExtensions = [
    ".js",
    ".ts",
    ".py",
    ".java",
    ".c",
    ".cpp",
    ".cs",
    ".rb",
    ".go",
    ".php",
    ".swift",
    ".kt",
    ".kts",
  ];
  const codeFiles = allFiles.filter((file) =>
    codeExtensions.includes(path.extname(file).toLowerCase()),
  );

  log.debug(`Found ${codeFiles.length} code files for analysis.`);
  let totalLines = 0;
  let totalComments = 0;

  for (const file of codeFiles) {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");
    totalLines += lines.length;
    const ext = path.extname(file).toLowerCase();
    const commentsInFile = countCommentLines(lines, ext);
    totalComments += commentsInFile;
    log.debug(
      `File: ${file}, Lines: ${lines.length}, Comments: ${commentsInFile}`,
    );
  }

  if (totalLines === 0) {
    log.debug("No lines of code found. Returning 0 for code-to-comment ratio.");
    return 0; // Avoid division by zero
  }

  const ratio = totalComments / (totalLines / 8);
  const normalizedRatio = Math.min(ratio, 1);
  const score = normalizedRatio * 0.5;

  log.debug(
    `Total lines: ${totalLines}, Total comments: ${totalComments}, Ratio: ${ratio}, Normalized score: ${score}`,
  );
  return score;
}

/*
  Function Name: getAllFiles
  Description: Recursively retrieves all files in a directory.
  @params: 
    - dir: string - The directory to search for files.
    - files: string[] - An array of file paths.
    - visitedPaths: Set<string> - A set of visited paths to avoid cycles.
  @returns: string[] - An array of file paths.
*/
export function getAllFiles(
  dir: string,
  files?: string[],
  visitedPaths?: Set<string>,
): string[] {
  files = files || [];
  visitedPaths = visitedPaths || new Set();

  log.info(`Reading directory: ${dir}`);
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.posix.join(dir, entry.name); // Use posix to normalize path

    if (visitedPaths.has(fullPath)) {
      continue;
    }
    visitedPaths.add(fullPath);

    let stats;
    try {
      stats = fs.lstatSync(fullPath);
    } catch (err) {
      log.error(`Error reading file stats for ${fullPath}: ${err}`);
      continue; // Skip this entry if there's an error
    }

    if (stats.isSymbolicLink()) {
      continue; // Skip symbolic links to avoid infinite loops
    } else if (stats.isDirectory()) {
      getAllFiles(fullPath, files, visitedPaths);
    } else if (stats.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

/*
  Function Name: countCommentLines
  Description: Counts the number of comment lines in the given lines of code based on the file extension.
  @params: 
    - lines: string[] - An array of lines of code.
    - ext: string - The file extension.
  @returns: number - The number of comment lines.
*/
export function countCommentLines(lines: string[], ext: string): number {
  let singleLineComment = "//";
  let multiLineCommentStart = "/*";
  let multiLineCommentEnd = "*/";

  // Adjust comment syntax based on file extension
  switch (ext) {
    case ".py":
      singleLineComment = "#";
      multiLineCommentStart = `'''`;
      multiLineCommentEnd = `'''`;
      break;
    case ".rb":
      singleLineComment = "#";
      multiLineCommentStart = "=begin";
      multiLineCommentEnd = "=end";
      break;
    // Add more languages if needed
  }

  let inMultiLineComment = false;
  let commentLines = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (inMultiLineComment) {
      commentLines++;
      // Check if this line ends the multi-line comment
      if (trimmedLine === multiLineCommentEnd) {
        inMultiLineComment = false;
      }
    } else if (trimmedLine.startsWith(singleLineComment)) {
      // Count single-line comments
      commentLines++;
    } else if (trimmedLine === multiLineCommentStart) {
      // If the line only contains the start of the multi-line comment, count it and enter multi-line mode
      commentLines++;
      inMultiLineComment = true;
    } else if (trimmedLine.includes(multiLineCommentStart)) {
      // If the multi-line comment starts and ends on the same line, count it only once
      commentLines++;
      if (!trimmedLine.includes(multiLineCommentEnd)) {
        inMultiLineComment = true;
      }
    }
  }

  return commentLines;
}
