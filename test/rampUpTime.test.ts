import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { calculateRampUpTime, checkReadme, checkInstallationInstructions, calculateCodeCommentRatio, getAllFiles, countCommentLines } from '../src/metrics/rampUpTime';

// Local mock for logger
const log = {
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
};

// Utility function to create temporary directory and files
function createTempDir() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-repo-'));
  return tempDir;
}

function writeFile(dir: string, filename: string, content: string) {
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, content);
}

describe('calculateRampUpTime', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should return correct score when README and install instructions exist', async () => {
    writeFile(tempDir, 'README.md', 'This is a test README with install instructions.\nRun this code.');

    const score = await calculateRampUpTime({} as any, tempDir);
    expect(score).toBeGreaterThan(0); // Expect some positive score
  });

  test('should return 0 when no README exists', async () => {
    writeFile(tempDir, 'index.js', 'console.log("Hello, world!");'); // No comments at all

    const score = await calculateRampUpTime({} as any, tempDir);
    expect(score).toBe(0); // No README, score should be zero if nothing else contributes
  });
});

describe('checkReadme', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should return true if README file exists', () => {
    writeFile(tempDir, 'README.md', 'This is a README');

    const result = checkReadme(tempDir);
    expect(result).toBe(true);
  });

  test('should return false if README file does not exist', () => {
    writeFile(tempDir, 'index.js', '// No README here\nconsole.log("Hello, world!");');

    const result = checkReadme(tempDir);
    expect(result).toBe(false);
  });
});

describe('checkInstallationInstructions', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should return true if installation instructions are found', () => {
    writeFile(tempDir, 'README.md', 'To install this package, run the following command.');

    const result = checkInstallationInstructions(tempDir);
    expect(result).toBe(true);
  });

  test('should return false if no installation instructions are found', () => {
    writeFile(tempDir, 'README.md', 'This is a README without any relevant keywords.');

    const result = checkInstallationInstructions(tempDir);
    expect(result).toBe(false);
  });
});

describe('calculateCodeCommentRatio', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should calculate the correct code-to-comment ratio', () => {
    writeFile(tempDir, 'index.js', '// This is a comment\nconsole.log("Hello, world!");');

    const result = calculateCodeCommentRatio(tempDir);
    expect(result).toBeGreaterThan(0); // Expect positive score due to comments in the file
  });

  test('should return 0 if no code files are found', () => {
    writeFile(tempDir, 'README.md', 'This is a README without any code files.');

    const result = calculateCodeCommentRatio(tempDir);
    expect(result).toBe(0); // No code files, score should be zero
  });
});

describe('getAllFiles', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
    fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should retrieve all files from directory recursively', () => {
    writeFile(tempDir, 'README.md', 'This is a README file.');
    writeFile(path.join(tempDir, 'src'), 'index.js', 'console.log("Hello, world!");');

    const files = getAllFiles(tempDir);

    // Normalize paths to handle differences between forward and backward slashes
    const expectedFiles = [
      path.normalize(path.join(tempDir, 'README.md')),
      path.normalize(path.join(tempDir, 'src', 'index.js')),
    ];

    // Normalize actual files as well
    const normalizedFiles = files.map(file => path.normalize(file));

    expect(normalizedFiles).toEqual(expect.arrayContaining(expectedFiles));
  });
});