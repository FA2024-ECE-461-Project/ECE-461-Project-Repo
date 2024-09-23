import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
  calculateRampUpTime,
  checkReadme,
  checkInstallationInstructions,
  calculateCodeCommentRatio,
  getAllFiles,
  countCommentLines,
} from "../src/metrics/rampUpTime";

// Local mock for logger
jest.mock("../src/logger", () => ({
  log: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

// Utility function to create temporary directory and files
function createTempDir() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "test-repo-"));
  return tempDir;
}

function writeFile(dir: string, filename: string, content: string) {
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, content);
}

describe("calculateRampUpTime", () => {
  let tempDir: string;
  const { log } = require("../src/logger"); // Use the mocked logger

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    jest.clearAllMocks(); // Clear mock logs after each test
  });

  it("should return correct score when README and install instructions exist", async () => {
    writeFile(
      tempDir,
      "README.md",
      "This is a test README with install instructions.\nRun this code.",
    );

    const score = await calculateRampUpTime({} as any, tempDir);
    expect(score).toBeGreaterThan(0); // Expect some positive score

    expect(log.info).toHaveBeenCalledWith(
      expect.stringContaining("Starting ramp-up time calculation"),
    );
    expect(log.debug).toHaveBeenCalledWith(
      expect.stringContaining("README file score: 0.1"),
    );
    expect(log.debug).toHaveBeenCalledWith(
      expect.stringContaining("Installation instruction score: 0.4"),
    );
  });

  it("should return 0 when no README exists", async () => {
    writeFile(tempDir, "index.js", 'console.log("Hello, world!");'); // No comments at all

    const score = await calculateRampUpTime({} as any, tempDir);
    expect(score).toBe(0); // No README, score should be zero if nothing else contributes

    expect(log.info).toHaveBeenCalledWith(
      expect.stringContaining("Starting ramp-up time calculation"),
    );
    expect(log.debug).toHaveBeenCalledWith(
      expect.stringContaining("README file score: 0"),
    );
    expect(log.debug).toHaveBeenCalledWith(
      expect.stringContaining("Installation instruction score: 0"),
    );
  });
});

describe("checkReadme", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("should return true if README file exists", async () => {
    writeFile(tempDir, "README.md", "This is a README");
    const result = checkReadme(tempDir);
    expect(result).toBe(true);
  });

  it("should return false if README file does not exist", async () => {
    writeFile(tempDir, "index.js", 'console.log("Hello, world!");');
    const result = checkReadme(tempDir);
    expect(result).toBe(false);
  });
});

describe("checkInstallationInstructions", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("should return true if installation instructions are found", async () => {
    writeFile(
      tempDir,
      "README.md",
      "To install this package, run the following command.",
    );

    const result = checkInstallationInstructions(tempDir);
    expect(result).toBe(true);
  });

  it("should return false if no installation instructions are found", async () => {
    writeFile(
      tempDir,
      "README.md",
      "This is a README without any relevant keywords.",
    );

    const result = checkInstallationInstructions(tempDir);
    expect(result).toBe(false);
  });
});

describe("calculateCodeCommentRatio", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // Test for JavaScript files
  it("should calculate the correct code-to-comment ratio for JavaScript", async () => {
    writeFile(
      tempDir,
      "index.js",
      '// This is a comment\nconsole.log("Hello, world!");',
    );

    const result = calculateCodeCommentRatio(tempDir);
    expect(result).toBeGreaterThan(0); // Expect positive score due to comments in the file
  });

  // Test for Python files
  it("should calculate the correct code-to-comment ratio for Python", async () => {
    writeFile(
      tempDir,
      "script.py",
      '# This is a comment\nprint("Hello, world!")\n',
    );

    const result = calculateCodeCommentRatio(tempDir);
    expect(result).toBeGreaterThan(0); // Expect positive score due to comments in the file
  });

  // Test for Python multi-line comments
  it("should calculate the correct code-to-comment ratio for Python multi-line comments", async () => {
    writeFile(
      tempDir,
      "script.py",
      `'''\nThis is a multi-line comment\n'''\nprint("Hello, world!")`,
    );

    const result = calculateCodeCommentRatio(tempDir);
    expect(result).toBeGreaterThan(0); // Expect positive score due to multi-line comments
  });

  // Test for Ruby files
  it("should calculate the correct code-to-comment ratio for Ruby", async () => {
    writeFile(
      tempDir,
      "script.rb",
      '# This is a comment\nputs "Hello, world!"',
    );

    const result = calculateCodeCommentRatio(tempDir);
    expect(result).toBeGreaterThan(0); // Expect positive score due to comments in the file
  });

  // Test for Ruby multi-line comments
  it("should calculate the correct code-to-comment ratio for Ruby multi-line comments", async () => {
    writeFile(
      tempDir,
      "script.rb",
      `=begin\nThis is a multi-line comment\n=end\nputs "Hello, world!"`,
    );

    const result = calculateCodeCommentRatio(tempDir);
    expect(result).toBeGreaterThan(0); // Expect positive score due to multi-line comments
  });

  // Test for no comments present
  it("should return 0 if no comments are present in code files", async () => {
    writeFile(tempDir, "index.js", 'console.log("Hello, world!");'); // No comments at all

    const result = calculateCodeCommentRatio(tempDir);
    expect(result).toBe(0); // No comments, score should be zero
  });

  // Test for no code files found
  it("should return 0 if no code files are found", async () => {
    writeFile(tempDir, "README.md", "This is a README without any code files.");

    const result = calculateCodeCommentRatio(tempDir);
    expect(result).toBe(0); // No code files, score should be zero
  });
});

describe("getAllFiles", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
    fs.mkdirSync(path.join(tempDir, "src"), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("should retrieve all files from directory recursively", async () => {
    writeFile(tempDir, "README.md", "This is a README file.");
    writeFile(
      path.join(tempDir, "src"),
      "index.js",
      'console.log("Hello, world!");',
    );

    const files = getAllFiles(tempDir);

    // Normalize paths to handle differences between forward and backward slashes
    const expectedFiles = [
      path.normalize(path.join(tempDir, "README.md")),
      path.normalize(path.join(tempDir, "src", "index.js")),
    ];

    // Normalize actual files as well
    const normalizedFiles = files.map((file) => path.normalize(file));

    expect(normalizedFiles).toEqual(expect.arrayContaining(expectedFiles));
  });

  it("should handle empty directories", async () => {
    const files = getAllFiles(tempDir); // No files

    expect(files.length).toBe(0);
  });

  it("should skip symbolic links", async () => {
    const symlinkPath = path.join(tempDir, "symlink");
    fs.symlinkSync("/some/real/path", symlinkPath);
    const files = getAllFiles(tempDir);

    expect(files).not.toContain(symlinkPath); // Ensure symlink is skipped
  });
});
