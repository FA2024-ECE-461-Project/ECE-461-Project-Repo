import { GetNetScore } from "../src/metrics/netScore";
import { getGithubInfo, RepoDetails } from "../src/apiProcess/gitApiProcess";
import { calculateRampUpTime } from "../src/metrics/rampUpTime";
import { calculateResponsiveness } from "../src/metrics/responsiveness";
import { calculateLicenseCompatibility } from "../src/metrics/licenseCompatibility";
import { calculateBusFactor } from "../src/metrics//busFactor";
import { calculateCorrectness } from "../src/metrics/correctness";
import { cloneRepo, removeRepo } from "../src/metrics/clone_repo";
import * as fs from "fs";
import { log } from "../src/logger";
import { clone } from "isomorphic-git";
import { REFUSED } from "dns";
import exp from "constants";

// Mock the logger to avoid actual logging during tests
jest.mock("../src/logger", () => ({
  log: {
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock the dependencies
jest.mock("../src/apiProcess/gitApiProcess");
jest.mock("../src/metrics/rampUpTime");
jest.mock("../src/metrics/responsiveness");
jest.mock("../src/metrics/licenseCompatibility");
jest.mock("../src/metrics//busFactor");
jest.mock("../src/metrics/correctness");
jest.mock("../src/metrics/clone_repo");
jest.mock("fs");
jest.mock("../src/logger");

// netScore.test.ts

// Mock the imported modules and functions
jest.mock("../src/apiProcess/gitApiProcess", () => ({
  getGithubInfo: jest.fn(),
}));

jest.mock("../src/metrics/rampUpTime", () => ({
  calculateRampUpTime: jest.fn(),
}));

jest.mock("../src/metrics/responsiveness", () => ({
  calculateResponsiveness: jest.fn(),
}));

jest.mock("../src/metrics/licenseCompatibility", () => ({
  calculateLicenseCompatibility: jest.fn(),
}));

jest.mock("../src/metrics//busFactor", () => ({
  calculateBusFactor: jest.fn(),
}));

jest.mock("../src/metrics/correctness", () => ({
  calculateCorrectness: jest.fn(),
}));

jest.mock("../src/metrics/clone_repo", () => ({
  cloneRepo: jest.fn(),
  removeRepo: jest.fn(),
}));

jest.mock("fs", () => ({
  existsSync: jest.fn(),
  rmSync: jest.fn(),
}));

jest.mock("../src/logger", () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe("GetNetScore", () => {
  const owner = "owner";
  const repo = "repo";
  const url = "https://github.com/owner/repo";

  it("should calculate NetScore correctly", async () => {
    const metrics: RepoDetails = {
      owner: "testOwner",
      repo: "testRepo",
      createdAt: "2022-01-01T00:00:00Z",
      stars: 0,
      openIssues: 0,
      forks: 0,
      license: "MIT",
      commitsData: [],
      issuesData: [],
      contributorsData: [],
    };
    (getGithubInfo as jest.Mock).mockResolvedValue(metrics);
    // Mock metric calculations with latency
    (cloneRepo as jest.Mock).mockResolvedValue(true);
    (removeRepo as jest.Mock).mockResolvedValue(true);
    (calculateRampUpTime as jest.Mock).mockResolvedValue(0.8);
    (calculateResponsiveness as jest.Mock).mockResolvedValue(0.9);
    (calculateLicenseCompatibility as jest.Mock).mockResolvedValue(1.0);
    (calculateBusFactor as jest.Mock).mockResolvedValue(0.7);
    (calculateCorrectness as jest.Mock).mockResolvedValue(0.85);

    const result = await GetNetScore(owner, repo, url);

    expect(result).not.toBeNull();
    expect(result).not.toBeUndefined();
    if (result !== null && result !== undefined) {
      expect(result.NetScore).not.toBeNull();
      expect(result.NetScore).toBeGreaterThanOrEqual(0);
      expect(result.NetScore).toBeLessThanOrEqual(1);
    }
  });
});
