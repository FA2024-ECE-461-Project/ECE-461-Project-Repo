import * as path from 'path';
import * as fs from 'fs';
import * as git from 'isomorphic-git';
import { cloneRepo, removeRepo } from '../src/metrics/clone_repo';

jest.mock('fs');
jest.mock('isomorphic-git');
jest.mock('isomorphic-git/http/node');

describe('cloneRepo', () => {
  const originalCwd = process.cwd;

  beforeEach(() => {
    jest.clearAllMocks();
    process.cwd = jest.fn().mockReturnValue('/mocked/path');
  });

  afterEach(() => {
    process.cwd = originalCwd;
  });

  it('should throw an error for an invalid GitHub URL', async () => {
    await expect(cloneRepo('invalid-url')).rejects.toThrow('Invalid GitHub URL');
  });

  it('should throw an error for a non-GitHub URL', async () => {
    await expect(cloneRepo('https://example.com/user/repo')).rejects.toThrow('Invalid GitHub URL');
  });

  it('should clone the repository successfully', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
    (git.clone as jest.Mock).mockResolvedValue(undefined);

    const repoPath = await cloneRepo('https://github.com/user/repo');

    expect(fs.existsSync).toHaveBeenCalledWith('/mocked/path/repo');
    expect(fs.mkdirSync).toHaveBeenCalledWith('/mocked/path/repo', { recursive: true });
    expect(git.clone).toHaveBeenCalledWith({
      fs,
      http: expect.any(Object),
      dir: '/mocked/path/repo',
      url: 'https://github.com/user/repo',
      singleBranch: true,
      depth: 1,
    });
    expect(repoPath).toBe('/mocked/path/repo');
  });
});

describe('removeRepo', () => {
  const originalCwd = process.cwd;

  beforeEach(() => {
    jest.clearAllMocks();
    process.cwd = jest.fn().mockReturnValue('/mocked/path');
  });

  afterEach(() => {
    process.cwd = originalCwd;
  });

  it('should throw an error if the repository path is outside the project directory', async () => {
    await expect(removeRepo('/outside/path/repo')).rejects.toThrow('Cannot remove files outside the project directory');
  });

  it('should throw an error if the repository path is the project directory', async () => {
    await expect(removeRepo('/mocked/path')).rejects.toThrow('Cannot remove the project directory');
  });

  it('should throw an error if the repository does not exist', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    await expect(removeRepo('/mocked/path/repo')).rejects.toThrow('Repository does not exist');
  });

  it('should remove the repository successfully', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.rm as unknown as jest.Mock).mockImplementation((_, __, callback) => callback(null));

    const result = await removeRepo('/mocked/path/repo');

    expect(fs.existsSync).toHaveBeenCalledWith('/mocked/path/repo');
    expect(fs.rm).toHaveBeenCalledWith('/mocked/path/repo', { recursive: true }, expect.any(Function));
    expect(result).toBe(true);
  });

  it('should throw an error if there is an error removing the repository', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.rm as unknown as jest.Mock).mockImplementation((_, __, callback) => callback(new Error('Error removing the repository')));

    await expect(removeRepo('/mocked/path/repo')).rejects.toThrow('Error removing the repository');
  });
});