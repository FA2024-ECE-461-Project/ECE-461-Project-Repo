import * as fs from 'fs';
import { readUrlsFromFile } from '../src/utils/fileUtils'; // Adjust the import path as necessary

jest.mock('fs');

describe('readUrlsFromFile', () => {
  it('should read URLs from a file and return them as an array of strings', async () => {
    const mockFileContent = 'https://example.com\nhttps://example.org\n';
    (fs.readFile as unknown as jest.Mock).mockImplementation((path, encoding, callback) => {
      callback(null, mockFileContent);
    });

    const result = await readUrlsFromFile('mockFilePath');
    expect(result).toEqual(['https://example.com', 'https://example.org']);
  });

  it('should handle errors when the file does not exist', async () => {
    const mockError = new Error('File not found');
    (fs.readFile as unknown as jest.Mock).mockImplementation((path, encoding, callback) => {
      callback(mockError, null);
    });

    await expect(readUrlsFromFile('mockFilePath')).rejects.toThrow('File not found');
  });

  it('should filter out empty lines from the file content', async () => {
    const mockFileContent = 'https://example.com\n\nhttps://example.org\n';
    (fs.readFile as unknown as jest.Mock).mockImplementation((path, encoding, callback) => {
      callback(null, mockFileContent);
    });

    const result = await readUrlsFromFile('mockFilePath');
    expect(result).toEqual(['https://example.com', 'https://example.org']);
  });
});