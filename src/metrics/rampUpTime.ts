import { RepoDetails } from '../apiProcess/gitApiProcess';
import * as fs from 'fs';
import * as path from 'path';

export async function calculateRampUpTime(metrics: RepoDetails, dir: string): Promise<number> {
  try {
    console.log(`Starting ramp-up time calculation for directory: ${dir}`);
    let score = 0;

    // (0.1) README_OR_NOT: bool = 0 (no) or 1 (yes)
    const readmeScore = checkReadme(dir) ? 0.1 : 0;
    console.log(`README file score: ${readmeScore}`);
    score += readmeScore;

    // (0.4) Installation instruction (keywords: install, test, launch, run, example)
    const installScore = checkInstallationInstructions(dir) ? 0.4 : 0;
    console.log(`Installation instruction score: ${installScore}`);
    score += installScore;

    // (0.5) Code-to-comment ratio = #comments / (lines of code / 8)
    const codeCommentRatioScore = calculateCodeCommentRatio(dir);
    console.log(`Code-to-comment ratio score: ${codeCommentRatioScore}`);
    score += codeCommentRatioScore;

    console.log(`Final ramp-up time score: ${score}`);
    return score;
  } catch (error) {
    console.error('Error calculating ramp-up time:', error);
    return 0;
  }
}

// Function to check for the existence of a README file
function checkReadme(dir: string): boolean {
  console.log(`Checking for README file in directory: ${dir}`);
  const files = fs.readdirSync(dir);
  const readmeFiles = files.filter(file => /^README(\.md|\.txt)?$/i.test(file));
  console.log(`README files found: ${readmeFiles.length}`);
  return readmeFiles.length > 0;
}

// Function to check for installation instructions in README files
function checkInstallationInstructions(dir: string): boolean {
  console.log(`Checking for installation instructions in README files in directory: ${dir}`);
  const files = fs.readdirSync(dir);
  const readmeFiles = files.filter(file => /^README(\.md|\.txt)?$/i.test(file));
  const keywords = ['install', 'test', 'launch', 'run', 'example'];

  for (const readmeFile of readmeFiles) {
    const content = fs.readFileSync(path.join(dir, readmeFile), 'utf8').toLowerCase();
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        console.log(`Installation instructions found with keyword: ${keyword}`);
        return true;
      }
    }
  }
  console.log('No installation instructions found.');
  return false;
}

// Function to calculate the code-to-comment ratio score
function calculateCodeCommentRatio(dir: string): number {
  console.log('Calculating code-to-comment ratio score...');
  const allFiles = getAllFiles(dir);
  const codeExtensions = ['.js', '.ts', '.py', '.java', '.c', '.cpp', '.cs', '.rb', '.go', '.php', '.swift', '.kt', '.kts'];
  const codeFiles = allFiles.filter(file => codeExtensions.includes(path.extname(file).toLowerCase()));

  console.log(`Found ${codeFiles.length} code files for analysis.`);

  let totalLines = 0;
  let totalComments = 0;

  for (const file of codeFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    totalLines += lines.length;
    const ext = path.extname(file).toLowerCase();
    const commentsInFile = countCommentLines(lines, ext);
    totalComments += commentsInFile;
    console.log(`File: ${file}, Lines: ${lines.length}, Comments: ${commentsInFile}`);
  }

  if (totalLines === 0) {
    console.log('No lines of code found. Returning 0 for code-to-comment ratio.');
    return 0; // Avoid division by zero
  }

  const ratio = totalComments / (totalLines / 8);
  const normalizedRatio = Math.min(ratio, 1);
  const score = normalizedRatio * 0.5;

  console.log(`Total lines: ${totalLines}, Total comments: ${totalComments}, Ratio: ${ratio}, Normalized score: ${score}`);
  return score;
}

// Helper function to get all files in the repository directory
function getAllFiles(dir: string, files?: string[], visitedPaths?: Set<string>): string[] {
  files = files || [];
  visitedPaths = visitedPaths || new Set();

  console.log(`Reading directory: ${dir}`);
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);

    // Check if we've already visited this path to avoid cycles
    if (visitedPaths.has(fullPath)) {
      continue;
    }
    visitedPaths.add(fullPath);

    let stats;
    try {
      stats = fs.lstatSync(fullPath);
    } catch (err) {
      console.error(`Error reading file stats for ${fullPath}: ${err}`);
      continue; // Skip this entry if there's an error
    }

    if (stats.isSymbolicLink()) {
      // Skip symbolic links to avoid infinite loops
      continue;
    } else if (stats.isDirectory()) {
      getAllFiles(fullPath, files, visitedPaths);
    } else if (stats.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

// Function to count the number of comment lines in code files
function countCommentLines(lines: string[], ext: string): number {
  let singleLineComment = '//';
  let multiLineCommentStart = '/*';
  let multiLineCommentEnd = '*/';

  // Adjust comment syntax based on file extension
  switch (ext) {
    case '.py':
      singleLineComment = '#';
      multiLineCommentStart = `'''`;
      multiLineCommentEnd = `'''`;
      break;
    case '.rb':
      singleLineComment = '#';
      multiLineCommentStart = '=begin';
      multiLineCommentEnd = '=end';
      break;
    // Add more languages if needed
  }

  let inMultiLineComment = false;
  let commentLines = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (inMultiLineComment) {
      commentLines++;
      if (trimmedLine.includes(multiLineCommentEnd)) {
        inMultiLineComment = false;
      }
    } else if (trimmedLine.startsWith(singleLineComment)) {
      commentLines++;
    } else if (trimmedLine.includes(multiLineCommentStart)) {
      commentLines++;
      if (!trimmedLine.includes(multiLineCommentEnd)) {
        inMultiLineComment = true;
      }
    }
  }
  console.log(`Comment lines: ${commentLines}`);
  return commentLines;
}
