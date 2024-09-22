import * as fs from 'fs';
import * as path from 'path';
import { readUrlsFromFile } from '../src/utils/fileUtils';

jest.mock('fs');
jest.mock('path');

describe('readUrlsFromFile', () => {
  const mockFilePath = 'testUrls.txt';
  const mockAbsolutePath = '/absolute/path/to/testUrls.txt';

  beforeEach(() => {
    jest.clearAllMocks();
    (path.resolve as jest.Mock).mockReturnValue(mockAbsolutePath);
  });

  it('should read URLs from a file and return them as an array of strings', async () => {
    const mockFileContent = 'https://example.com\nhttps://example.org\n';
    (fs.readFile as unknown as jest.Mock).mockImplementation((path, encoding, callback) => {
      callback(null, mockFileContent);
    });

    const urls = await readUrlsFromFile(mockFilePath);
    expect(urls).toEqual(['https://example.com', 'https://example.org']);
    expect(path.resolve).toHaveBeenCalledWith(mockFilePath);
    expect(fs.readFile).toHaveBeenCalledWith(mockAbsolutePath, 'utf8', expect.any(Function));
  });

  it('should handle errors when the file does not exist', async () => {
    const mockError = new Error('File not found');
    (fs.readFile as unknown as jest.Mock).mockImplementation((path, encoding, callback) => {
      callback(mockError, null);
    });

    await expect(readUrlsFromFile(mockFilePath)).rejects.toEqual(`Error reading file: ${mockError.message}`);
    expect(path.resolve).toHaveBeenCalledWith(mockFilePath);
    expect(fs.readFile).toHaveBeenCalledWith(mockAbsolutePath, 'utf8', expect.any(Function));
  });

  it('should filter out empty lines from the file content', async () => {
    const mockFileContent = 'https://example.com\n\nhttps://example.org\n';
    (fs.readFile as unknown as jest.Mock).mockImplementation((path, encoding, callback) => {
      callback(null, mockFileContent);
    });

    const urls = await readUrlsFromFile(mockFilePath);
    expect(urls).toEqual(['https://example.com', 'https://example.org']);
    expect(path.resolve).toHaveBeenCalledWith(mockFilePath);
    expect(fs.readFile).toHaveBeenCalledWith(mockAbsolutePath, 'utf8', expect.any(Function));
  });
});