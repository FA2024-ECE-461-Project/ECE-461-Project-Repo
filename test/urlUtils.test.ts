import { checkUrlType, convertSshToHttps, extractOwnerAndRepo, extractPackageNameFromUrl, processUrl, UrlType } from '../src/utils/urlUtils';
import { getGitHubRepoFromNpmUrl } from '../src/apiProcess/npmApiProcess';
import { log } from '../src/logger';

jest.mock('../src/apiProcess/npmApiProcess');
jest.mock('../src/logger');

describe('urlUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkUrlType', () => {
    it('should identify GitHub URL', () => {
      const url = 'https://github.com/owner/repo';
      const result = checkUrlType(url);
      expect(result).toBe(UrlType.GitHub);
      expect(log.info).toHaveBeenCalledWith(`Checking URL type for: ${url}`);
      expect(log.info).toHaveBeenCalledWith('URL identified as GitHub URL.');
    });

    it('should identify npm URL', () => {
      const url = 'https://www.npmjs.com/package/package-name';
      const result = checkUrlType(url);
      expect(result).toBe(UrlType.npm);
      expect(log.info).toHaveBeenCalledWith(`Checking URL type for: ${url}`);
      expect(log.info).toHaveBeenCalledWith('URL identified as npm URL.');
    });

    it('should identify invalid URL', () => {
      const url = 'https://invalid-url.com';
      const result = checkUrlType(url);
      expect(result).toBe(UrlType.Invalid);
      expect(log.info).toHaveBeenCalledWith(`Checking URL type for: ${url}`);
      expect(log.warn).toHaveBeenCalledWith('Invalid URL type detected.');
    });
  });

  describe('convertSshToHttps', () => {
    it('should convert SSH URL to HTTPS', () => {
      const sshUrl = 'git@github.com:owner/repo.git';
      const result = convertSshToHttps(sshUrl);
      expect(result).toBe('https://github.com/owner/repo');
      expect(log.info).toHaveBeenCalledWith(`Converting SSH URL to HTTPS: ${sshUrl}`);
      expect(log.info).toHaveBeenCalledWith('Converted SSH URL to HTTPS: https://github.com/owner/repo');
    });

    it('should return original URL if not SSH', () => {
      const sshUrl = 'https://github.com/owner/repo';
      const result = convertSshToHttps(sshUrl);
      expect(result).toBe(sshUrl);
      expect(log.info).toHaveBeenCalledWith(`Converting SSH URL to HTTPS: ${sshUrl}`);
      expect(log.info).toHaveBeenCalledWith(`Input URL is not an SSH URL, returning original: ${sshUrl}`);
    });
  });

  describe('extractOwnerAndRepo', () => {
    it('should extract owner and repo from GitHub URL', () => {
      const gitHubUrl = 'https://github.com/owner/repo';
      const result = extractOwnerAndRepo(gitHubUrl);
      expect(result).toEqual({ owner: 'owner', repo: 'repo' });
      expect(log.info).toHaveBeenCalledWith(`Extracting owner and repo from GitHub URL: ${gitHubUrl}`);
      expect(log.info).toHaveBeenCalledWith('Extracted owner: owner, repo: repo');
    });

    it('should throw error for invalid GitHub URL', () => {
      const gitHubUrl = 'https://github.com/invalid-url';
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });

      expect(() => extractOwnerAndRepo(gitHubUrl)).toThrow('process.exit');
      expect(log.info).toHaveBeenCalledWith(`Extracting owner and repo from GitHub URL: ${gitHubUrl}`);
      expect(log.error).toHaveBeenCalledWith('Invalid GitHub URL - unable to extract owner and repo.');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('extractPackageNameFromUrl', () => {
    it('should extract npm package name from URL', () => {
      const url = 'https://www.npmjs.com/package/package-name';
      const result = extractPackageNameFromUrl(url);
      expect(result).toBe('package-name');
      expect(log.info).toHaveBeenCalledWith(`Extracting package name from URL: ${url}`);
      expect(log.info).toHaveBeenCalledWith('Extracted npm package name: package-name');
    });

    it('should extract GitHub repo name from URL', () => {
      const url = 'https://github.com/owner/repo';
      const result = extractPackageNameFromUrl(url);
      expect(result).toBe('repo');
      expect(log.info).toHaveBeenCalledWith(`Extracting package name from URL: ${url}`);
      expect(log.info).toHaveBeenCalledWith('Extracted GitHub repo name: repo');
    });

  });

  describe('processUrl', () => {
    it('should process GitHub URL', async () => {
      const url = 'https://github.com/owner/repo';
      const result = await processUrl(UrlType.GitHub, url);
      expect(result).toEqual({ owner: 'owner', repo: 'repo' });
      expect(log.info).toHaveBeenCalledWith(`Processing URL of type: github, URL: ${url}`);
      expect(log.info).toHaveBeenCalledWith('Processing GitHub URL...');
      expect(log.info).toHaveBeenCalledWith('Successfully processed URL. Owner: owner, Repo: repo');
    });

    it('should process npm URL', async () => {
      const url = 'https://www.npmjs.com/package/package-name';
      const gitHubUrl = 'git@github.com:owner/repo.git';
      (getGitHubRepoFromNpmUrl as jest.Mock).mockResolvedValue(gitHubUrl);

      const result = await processUrl(UrlType.npm, url);
      expect(result).toEqual({ owner: 'owner', repo: 'repo' });
      expect(log.info).toHaveBeenCalledWith(`Processing URL of type: npm, URL: ${url}`);
      expect(log.info).toHaveBeenCalledWith('Extracting npm package and corresponding GitHub repo...');
      expect(log.info).toHaveBeenCalledWith('Successfully processed URL. Owner: owner, Repo: repo');
    });

    it('should throw error for invalid URL type', async () => {
      const url = 'https://invalid-url.com';
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });

      await expect(processUrl(UrlType.Invalid, url)).rejects.toThrow('process.exit');
      expect(log.info).toHaveBeenCalledWith(`Processing URL of type: invalid, URL: ${url}`);
      expect(log.error).toHaveBeenCalledWith('Invalid URL type, cannot process.');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });
});