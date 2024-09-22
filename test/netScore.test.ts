process.env.GITHUB_TOKEN = 'test-token';
import { GetNetScore, measureLatency } from '../src/metrics/netScore';
import { getGithubInfo } from '../src/apiProcess/gitApiProcess';
import { calculateRampUpTime } from '../src/metrics/rampUpTime';
import { calculateResponsiveness } from '../src/metrics/responsiveness';
import { calculateLicenseCompatibility } from '../src/metrics/licenseCompatibility';
import { calculateBusFactor } from '../src/metrics/busFactor';
import { calculateCorrectness } from '../src/metrics/correctness';
import { cloneRepo, removeRepo } from '../src/metrics/clone_repo';
import * as fs from 'fs';
import { log } from '../src/logger';

jest.mock('../src/apiProcess/gitApiProcess');
jest.mock('../src/metrics/rampUpTime');
jest.mock('../src/metrics/responsiveness');
jest.mock('../src/metrics/licenseCompatibility');
jest.mock('../src/metrics/busFactor');
jest.mock('../src/metrics/correctness');
jest.mock('../src/metrics/clone_repo');
jest.mock('fs');
jest.mock('../src/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

// Mock process.exit to prevent it from exiting during the test
jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null) => {
  throw new Error(`process.exit: ${code}`);
});

describe('GetNetScore Function Tests', () => {
  const owner = 'test-owner';
  const repo = 'test-repo';
  const url = 'https://github.com/test-owner/test-repo';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GITHUB_TOKEN = 'mocked_github_token';
  });

  it('should return a NetScore between 0 and 1 for valid input', async () => {
    // Mock data
    const gitInfoMock = {      
      owner: 'testOwner',
      repo: 'testRepo',
      createdAt: '2022-01-01T00:00:00Z',
      stars: 0,
      openIssues: 0,
      forks: 0,
      license: 'MIT',
      commitsData: [],
      issuesData: [],
      contributorsData: [],
    };

    const clonedPathMock = '/mocked/path/to/cloned/repo';

    // Mock implementations
    (getGithubInfo as jest.Mock).mockResolvedValue(gitInfoMock);
    (cloneRepo as jest.Mock).mockResolvedValue(clonedPathMock);
    (measureLatency as jest.Mock).mockImplementation((fn, ...args) => {
      if (fn === calculateRampUpTime) {
        return Promise.resolve({ value: 0.8, latency: 0.5 });
      } else if (fn === calculateResponsiveness) {
        return Promise.resolve({ value: 0.7, latency: 0.6 });
      } else if (fn === calculateLicenseCompatibility) {
        return Promise.resolve({ value: 1.0, latency: 0.7 });
      } else if (fn === calculateBusFactor) {
        return Promise.resolve({ value: 0.6, latency: 0.8 });
      } else if (fn === calculateCorrectness) {
        return Promise.resolve({ value: 0.9, latency: 0.9 });
      }
      return Promise.resolve({ value: 0, latency: 0 });
    });
    (removeRepo as jest.Mock).mockResolvedValue(true);
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.rmSync as jest.Mock).mockImplementation(() => {});

    // Call the function
    const result = await GetNetScore(owner, repo, url);

    // Assertions
    expect(result).not.toBeNull();
    expect(result.NetScore).toBeGreaterThanOrEqual(0);
    expect(result.NetScore).toBeLessThanOrEqual(1);
  });

  it('should return null if getGithubInfo fails', async () => {
    (getGithubInfo as jest.Mock).mockResolvedValue(null);

    const result = await GetNetScore(owner, repo, url);

    expect(result).toBeNull();
    expect(log.error).toHaveBeenCalledWith('Failed to retrieve repository info');
  });

  it('should handle exceptions and return null', async () => {
    (getGithubInfo as jest.Mock).mockRejectedValue(new Error('Network Error'));

    const result = await GetNetScore(owner, repo, url);

    expect(result).toBeNull();
    expect(log.error).toHaveBeenCalledWith(
      `GetNetScore: Failed to calculate metrics for ${url}`,
      expect.any(Error),
    );
  });
});