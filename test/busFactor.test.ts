import { calculateBusFactor } from "../src/metrics/busFactor";
import { RepoDetails } from "../src/apiProcess/gitApiProcess";
import { log } from "../src/logger";

jest.mock('../src/logger', () => ({
  log: {
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("calculateBusFactor", () => {
  it("should calculate bus factor for multiple contributors", () => {
    const metrics: RepoDetails = {
      owner: "owner",
      repo: "repo",
      createdAt: "2021-01-01",
      stars: 100,
      openIssues: 100,
      forks: 50,
      license: "MIT",
      commitsData: ["commitsData"],
      issuesData: ["1", "2", "3"],
      contributorsData: [
        { name: "Alice", commits: 50 },
        { name: "Bob", commits: 30 },
        { name: "Charlie", commits: 20 },
      ]
    };

    const result = calculateBusFactor(metrics);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  it("should handle no contributors", () => {
    const metrics: RepoDetails = {
      owner: "owner",
      repo: "repo",
      createdAt: "2021-01-01",
      stars: 100,
      openIssues: 100,
      forks: 50,
      license: "MIT",
      commitsData: ["commitsData"],
      issuesData: ["1", "2", "3"],
      contributorsData: []
    };

    const result = calculateBusFactor(metrics);
    expect(result).toBe(0);
  });
  it("should handle one contributor", () => {
    const metrics: RepoDetails = {
      owner: "owner",
      repo: "repo",
      createdAt: "2021-01-01",
      stars: 100,
      openIssues: 100,
      forks: 50,
      license: "MIT",
      commitsData: ["commitsData"],
      issuesData: ["1", "2", "3"],
      contributorsData: [{ name: "Alice", commits: 50 }]
    };

    const result = calculateBusFactor(metrics);
    expect(result).toBe(0);
  })
});