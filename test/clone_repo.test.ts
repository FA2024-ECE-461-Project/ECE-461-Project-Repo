// clone_repo.test.ts
// Mock 'fs' module before importing it
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  truncateSync: jest.fn(),
  appendFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  rm: jest.fn(),
  // Include any other fs methods you need to mock
}));

import * as path from "path";
import * as fs from "fs";
import * as git from "isomorphic-git";
import * as http from "isomorphic-git/http/node";
import { cloneRepo, removeRepo } from "../src/metrics/clone_repo";

jest.mock("isomorphic-git");
jest.mock("isomorphic-git/http/node");

describe("cloneRepo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should clone a repository with a valid GitHub URL", async () => {
    // Arrange
    const githubUrl = "https://github.com/user/repo";
    const expectedRepoPath = path.join(process.cwd(), "repo");

    // Mock fs.existsSync to return false (repo does not exist)
    jest.spyOn(fs, "existsSync").mockReturnValue(false);

    // Mock fs.mkdirSync to do nothing
    jest.spyOn(fs, "mkdirSync").mockImplementation(() => undefined);

    // Mock git.clone to resolve successfully
    (git.clone as jest.Mock).mockResolvedValue(undefined);

    // Act
    const repoPath = await cloneRepo(githubUrl);

    // Assert
    expect(repoPath).toBe(expectedRepoPath);
    expect(fs.existsSync).toHaveBeenCalledWith(expectedRepoPath);
    expect(fs.mkdirSync).toHaveBeenCalledWith(expectedRepoPath, {
      recursive: true,
    });
    expect(git.clone).toHaveBeenCalledWith({
      fs,
      http,
      dir: expectedRepoPath,
      url: githubUrl,
      singleBranch: true,
      depth: 1,
    });
  });

  it("should throw an error with an invalid GitHub URL", async () => {
    // Arrange
    const invalidUrl = "https://notgithub.com/user/repo";

    // Act & Assert
    await expect(cloneRepo(invalidUrl)).rejects.toThrow("Invalid GitHub URL");
  });

  it("should throw an error with a malformed URL", async () => {
    // Arrange
    const invalidUrl = "not a url";

    // Act & Assert
    await expect(cloneRepo(invalidUrl)).rejects.toThrow("Invalid GitHub URL");
  });

  it("should not create directory if repo path already exists", async () => {
    // Arrange
    const githubUrl = "https://github.com/user/repo";
    const expectedRepoPath = path.join(process.cwd(), "repo");

    // Mock fs.existsSync to return true (repo already exists)
    jest.spyOn(fs, "existsSync").mockReturnValue(true);

    // Mock fs.mkdirSync (should not be called)
    const mkdirSyncSpy = jest
      .spyOn(fs, "mkdirSync")
      .mockImplementation(() => undefined);

    // Mock git.clone to resolve successfully
    (git.clone as jest.Mock).mockResolvedValue(undefined);

    // Act
    const repoPath = await cloneRepo(githubUrl);

    // Assert
    expect(repoPath).toBe(expectedRepoPath);
    expect(fs.existsSync).toHaveBeenCalledWith(expectedRepoPath);
    expect(mkdirSyncSpy).not.toHaveBeenCalled();
    expect(git.clone).toHaveBeenCalledWith({
      fs,
      http,
      dir: expectedRepoPath,
      url: githubUrl,
      singleBranch: true,
      depth: 1,
    });
  });
});

describe("removeRepo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should remove the repository when the path is valid and exists", async () => {
    // Arrange
    const repoPath = path.join(process.cwd(), "repo");

    // Mock fs.existsSync to return true
    jest.spyOn(fs, "existsSync").mockReturnValue(true);

    // Mock fs.rm to simulate successful removal
    jest.spyOn(fs, "rm").mockImplementation((path, options, callback) => {
      callback(null);
    });

    // Act
    const result = await removeRepo(repoPath);

    // Assert
    expect(result).toBe(true);
    expect(fs.existsSync).toHaveBeenCalledWith(repoPath);
    expect(fs.rm).toHaveBeenCalledWith(
      repoPath,
      { recursive: true },
      expect.any(Function),
    );
  });

  it("should throw an error when the repository does not exist", async () => {
    // Arrange
    const repoPath = path.join(process.cwd(), "repo");

    // Mock fs.existsSync to return false
    jest.spyOn(fs, "existsSync").mockReturnValue(false);

    // Act & Assert
    await expect(removeRepo(repoPath)).rejects.toThrow(
      "Repository does not exist",
    );
    expect(fs.existsSync).toHaveBeenCalledWith(repoPath);
  });

  it("should prevent removal outside the project directory", async () => {
    // Arrange
    const repoPath = "/etc/passwd";

    // Act & Assert
    await expect(removeRepo(repoPath)).rejects.toThrow(
      "Cannot remove files outside the project directory",
    );
  });

  it("should prevent removal of the project directory itself", async () => {
    // Arrange
    const repoPath = process.cwd();

    // Mock fs.existsSync to return true
    jest.spyOn(fs, "existsSync").mockReturnValue(true);

    // Act & Assert
    await expect(removeRepo(repoPath)).rejects.toThrow(
      "Cannot remove the project directory",
    );
  });

  it("should handle errors during repository removal", async () => {
    // Arrange
    const repoPath = path.join(process.cwd(), "repo");

    // Mock fs.existsSync to return true
    jest.spyOn(fs, "existsSync").mockReturnValue(true);

    // Mock fs.rm to simulate an error
    jest.spyOn(fs, "rm").mockImplementation((path, options, callback) => {
      callback(new Error("Removal error"));
    });

    // Act & Assert
    await expect(removeRepo(repoPath)).rejects.toThrow(
      "Error removing the repository",
    );
    expect(fs.rm).toHaveBeenCalledWith(
      repoPath,
      { recursive: true },
      expect.any(Function),
    );
  });
});
