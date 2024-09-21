import { GetNetScore } from '../src/metrics/netScore';
import { getGithubInfo } from '../src/apiProcess/gitApiProcess';
import { calculateRampUpTime } from '../src/metrics/rampUpTime';
import { calculateResponsiveness } from '../src/metrics/responsiveness';
import { calculateLicenseCompatibility } from '../src/metrics/licenseCompatibility';
import { calculateBusFactor } from '../src/metrics//busFactor';
import { calculateCorrectness } from '../src/metrics/correctness';
import { cloneRepo, removeRepo } from '../src/metrics/clone_repo';
import * as fs from 'fs';
import { log } from '../src/logger';

// Mock the dependencies
jest.mock('../src/metrics/netScore');
jest.mock('../src/apiProcess/gitApiProcess');
jest.mock('../src/metrics/rampUpTime');
jest.mock('../src/metrics/responsiveness');
jest.mock('../src/metrics/licenseCompatibility');
jest.mock('../src/metrics//busFactor');
jest.mock('../src/metrics/correctness');
jest.mock('../src/metrics/clone_repo');
jest.mock('fs');
jest.mock('../src/logger');

describe('GetNetScore', () => {
  const owner = 'owner';
  const repo = 'repo';
  const url = `https://github.com/${owner}/${repo}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null if getGithubInfo fails', async () => {
    (getGithubInfo as jest.Mock).mockResolvedValue(null);

    const result = await GetNetScore(owner, repo, url);

    expect(result).toBeNull();
    expect(log.error).toHaveBeenCalledWith('Failed to get repository info');
  });

  it('should calculate NetScore correctly', async () => {
    const gitInfo = { contributorsData: [] };
    (getGithubInfo as jest.Mock).mockResolvedValue(gitInfo);
    (cloneRepo as jest.Mock).mockResolvedValue('/path/to/cloned/repo');
    (removeRepo as jest.Mock).mockResolvedValue(true);

    (calculateRampUpTime as jest.Mock).mockResolvedValue(0.8);
    (calculateResponsiveness as jest.Mock).mockResolvedValue(0.7);
    (calculateLicenseCompatibility as jest.Mock).mockResolvedValue(0.9);
    (calculateBusFactor as jest.Mock).mockResolvedValue(0.6);
    (calculateCorrectness as jest.Mock).mockResolvedValue(0.85);

    const result = await GetNetScore(owner, repo, url);

    expect(result).toEqual({
      URL: url,
      NetScore: 0.75,
      NetScore_Latency: expect.any(Number),
      RampUp: 0.8,
      RampUp_Latency: expect.any(Number),
      Correctness: 0.85,
      Correctness_Latency: expect.any(Number),
      BusFactor: 0.6,
      BusFactor_Latency: expect.any(Number),
      ResponsiveMaintainer: 0.7,
      ResponsiveMaintainer_Latency: expect.any(Number),
      License: 0.9,
      License_Latency: expect.any(Number),
    });

    expect(getGithubInfo).toHaveBeenCalledWith(owner, repo);
    expect(cloneRepo).toHaveBeenCalledWith(`https://github.com/${owner}/${repo}.git`);
    expect(removeRepo).toHaveBeenCalledWith('/path/to/cloned/repo');
  });

  it('should handle errors gracefully', async () => {
    (getGithubInfo as jest.Mock).mockRejectedValue(new Error('GitHub API error'));

    const result = await GetNetScore(owner, repo, url);

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('GetNetScore: Failed to get repository info:', expect.any(Error));
  });

  it('should clean up the cloned repository', async () => {
    const gitInfo = { contributorsData: [] };
    (getGithubInfo as jest.Mock).mockResolvedValue(gitInfo);
    (cloneRepo as jest.Mock).mockResolvedValue('/path/to/cloned/repo');
    (removeRepo as jest.Mock).mockResolvedValue(true);

    (calculateRampUpTime as jest.Mock).mockResolvedValue(0.8);
    (calculateResponsiveness as jest.Mock).mockResolvedValue(0.7);
    (calculateLicenseCompatibility as jest.Mock).mockResolvedValue(0.9);
    (calculateBusFactor as jest.Mock).mockResolvedValue(0.6);
    (calculateCorrectness as jest.Mock).mockResolvedValue(0.85);

    await GetNetScore(owner, repo, url);

    expect(fs.rmSync).toHaveBeenCalledWith('/path/to/cloned/repo', { recursive: true, force: true });
  });
});