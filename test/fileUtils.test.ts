// fileUtils.test.ts

// Mock 'fs' module before importing the module that uses it
jest.mock("fs", () => {
  return {
    readFile: jest.fn(),
  };
});

import * as fs from "fs";
import * as path from "path";
import { readUrlsFromFile } from "../src/utils/fileUtils";

describe("readUrlsFromFile", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should read URLs from a file and return an array of URLs", async () => {
    // Arrange
    const filePath = "/path/to/file.txt";
    const fileContent = "http://example.com\nhttps://example.org\n";
    const absolutePath = path.resolve(filePath);

    // Mock fs.readFile to simulate successful file read
    (fs.readFile as unknown as jest.Mock).mockImplementation(
      (path, encoding, callback) => {
        expect(path).toBe(absolutePath);
        expect(encoding).toBe("utf8");
        callback(null, fileContent);
      },
    );

    // Act
    const urls = await readUrlsFromFile(filePath);

    // Assert
    expect(urls).toEqual(["http://example.com", "https://example.org"]);
    expect(fs.readFile).toHaveBeenCalledWith(
      absolutePath,
      "utf8",
      expect.any(Function),
    );
  });

  it("should reject the promise if there is an error reading the file", async () => {
    // Arrange
    const filePath = "/path/to/nonexistent.txt";
    const errorMessage = "File not found";

    // Mock fs.readFile to simulate an error during file read
    (fs.readFile as unknown as jest.Mock).mockImplementation(
      (path, encoding, callback) => {
        callback(new Error(errorMessage), null);
      },
    );

    // Act & Assert
    await expect(readUrlsFromFile(filePath)).rejects.toEqual(
      `Error reading file: ${errorMessage}`,
    );
    expect(fs.readFile).toHaveBeenCalledWith(
      path.resolve(filePath),
      "utf8",
      expect.any(Function),
    );
  });

  it("should filter out empty lines from the file content", async () => {
    // Arrange
    const filePath = "/path/to/file.txt";
    const fileContent = "http://example.com\n\nhttps://example.org\n\n";
    const absolutePath = path.resolve(filePath);

    // Mock fs.readFile to provide file content with empty lines
    (fs.readFile as unknown as jest.Mock).mockImplementation(
      (path, encoding, callback) => {
        callback(null, fileContent);
      },
    );

    // Act
    const urls = await readUrlsFromFile(filePath);

    // Assert
    expect(urls).toEqual(["http://example.com", "https://example.org"]);
  });

  it("should return an empty array if the file contains only empty lines", async () => {
    // Arrange
    const filePath = "/path/to/file.txt";
    const fileContent = "\n\n";
    const absolutePath = path.resolve(filePath);

    // Mock fs.readFile to provide file content with only empty lines
    (fs.readFile as unknown as jest.Mock).mockImplementation(
      (path, encoding, callback) => {
        callback(null, fileContent);
      },
    );

    // Act
    const urls = await readUrlsFromFile(filePath);

    // Assert
    expect(urls).toEqual([]);
  });
});
