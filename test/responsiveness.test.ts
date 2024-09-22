import { calculateResponsiveness } from "../src/metrics/responsiveness";
import { RepoDetails } from "../src/apiProcess/gitApiProcess";
import { log } from "../src/logger";
import { on } from "events";
import exp from "constants";

// Mock the logger to avoid actual logging during tests
jest.mock("../src/logger", () => ({
  log: {
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("calculateResponsiveness", () => {
  it("should return 0 when there are no commits and no issues", () => {
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

    const result = calculateResponsiveness(metrics);
    expect(result).toBe(0);
  });

  it("should calculate commit frequency ratio correctly", () => {
    const metrics: RepoDetails = {
      owner: "testOwner",
      repo: "testRepo",
      createdAt: "2022-01-01T00:00:00Z",
      stars: 0,
      openIssues: 0,
      forks: 0,
      license: "MIT",
      commitsData: [
        { commit: { author: { date: "2024-06-03T00:00:00Z" } } },
        { commit: { author: { date: "2024-06-02T00:00:00Z" } } },
        { commit: { author: { date: "2024-06-01T00:00:00Z" } } },
      ],
      issuesData: [],
      contributorsData: [],
    };

    const result = calculateResponsiveness(metrics);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1);
  });

  it("should handle mixed data correctly", () => {
    const metrics: RepoDetails = {
      owner: "testOwner",
      repo: "testRepo",
      createdAt: "2022-01-01T00:00:00Z",
      stars: 0,
      openIssues: 0,
      forks: 0,
      license: "MIT",
      commitsData: [
        { commit: { author: { date: "2024-06-03T00:00:00Z" } } },
        { commit: { author: { date: "2024-06-02T00:00:00Z" } } },
        { commit: { author: { date: "2024-06-01T00:00:00Z" } } },
      ],
      issuesData: [
        { created_at: "2024-08-03T00:00:00Z", state: "open" },
        {
          created_at: "2024-08-01T00:00:00Z",
          state: "closed",
          closed_at: "2024-08-02T00:00:00Z",
        },
        {
          created_at: "2024-07-01T00:00:00Z",
          state: "closed",
          closed_at: "2024-07-02T00:00:00Z",
        },
      ],
      contributorsData: [],
    };

    const result = calculateResponsiveness(metrics);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1);
  });

  it("should return a value between 0 and 1", () => {
    const metrics: RepoDetails = {
      owner: "testOwner",
      repo: "testRepo",
      createdAt: "2022-01-01T00:00:00Z",
      stars: 0,
      openIssues: 0,
      forks: 0,
      license: "MIT",
      commitsData: [
        { commit: { author: { date: "2024-06-03T00:00:00Z" } } },
        { commit: { author: { date: "2024-06-02T00:00:00Z" } } },
        { commit: { author: { date: "2024-06-01T00:00:00Z" } } },
      ],
      issuesData: [
        { created_at: "2024-08-03T00:00:00Z", state: "open" },
        {
          created_at: "2024-08-01T00:00:00Z",
          state: "closed",
          closed_at: "2024-08-02T00:00:00Z",
        },
        {
          created_at: "2024-07-01T00:00:00Z",
          state: "closed",
          closed_at: "2024-07-02T00:00:00Z",
        },
      ],
      contributorsData: [],
    };

    const result = calculateResponsiveness(metrics);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });
  it("should return a value of 1 when all issues opened and closed yesterday", () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const metrics: RepoDetails = {
      owner: "testOwner",
      repo: "testRepo",
      createdAt: "2022-01-01T00:00:00Z",
      stars: 0,
      openIssues: 0,
      forks: 0,
      license: "MIT",
      commitsData: [
        { commit: { author: { date: yesterday.toISOString() } } },
        { commit: { author: { date: yesterday.toISOString() } } },
        { commit: { author: { date: yesterday.toISOString() } } },
        { commit: { author: { date: yesterday.toISOString() } } },
        { commit: { author: { date: yesterday.toISOString() } } },
        { commit: { author: { date: yesterday.toISOString() } } },
        { commit: { author: { date: yesterday.toISOString() } } },
        { commit: { author: { date: yesterday.toISOString() } } },
        { commit: { author: { date: yesterday.toISOString() } } },
        { commit: { author: { date: yesterday.toISOString() } } },
        { commit: { author: { date: yesterday.toISOString() } } },
      ],
      issuesData: [
        {
          created_at: yesterday.toISOString(),
          state: "closed",
          closed_at: yesterday.toISOString(),
        },
        {
          created_at: yesterday.toISOString(),
          state: "closed",
          closed_at: yesterday.toISOString(),
        },
        {
          created_at: yesterday.toISOString(),
          state: "closed",
          closed_at: yesterday.toISOString(),
        },
        {
          created_at: yesterday.toISOString(),
          state: "closed",
          closed_at: yesterday.toISOString(),
        },
        {
          created_at: yesterday.toISOString(),
          state: "closed",
          closed_at: yesterday.toISOString(),
        },
        {
          created_at: yesterday.toISOString(),
          state: "closed",
          closed_at: yesterday.toISOString(),
        },
        {
          created_at: yesterday.toISOString(),
          state: "closed",
          closed_at: yesterday.toISOString(),
        },
        {
          created_at: yesterday.toISOString(),
          state: "closed",
          closed_at: yesterday.toISOString(),
        },
        {
          created_at: yesterday.toISOString(),
          state: "closed",
          closed_at: yesterday.toISOString(),
        },
        {
          created_at: yesterday.toISOString(),
          state: "closed",
          closed_at: yesterday.toISOString(),
        },
      ],
      contributorsData: [],
    };

    const result = calculateResponsiveness(metrics);
    expect(result).toBe(1);
  });

  it("should return a value 0-1 for commits and issues 6 months ago", () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const metrics: RepoDetails = {
      owner: "testOwner",
      repo: "testRepo",
      createdAt: "2022-01-01T00:00:00Z",
      stars: 0,
      openIssues: 0,
      forks: 0,
      license: "MIT",
      commitsData: [
        { commit: { author: { date: sixMonthsAgo.toISOString() } } },
        { commit: { author: { date: sixMonthsAgo.toISOString() } } },
        { commit: { author: { date: sixMonthsAgo.toISOString() } } },
        { commit: { author: { date: sixMonthsAgo.toISOString() } } },
        { commit: { author: { date: sixMonthsAgo.toISOString() } } },
        { commit: { author: { date: sixMonthsAgo.toISOString() } } },
        { commit: { author: { date: sixMonthsAgo.toISOString() } } },
        { commit: { author: { date: sixMonthsAgo.toISOString() } } },
        { commit: { author: { date: sixMonthsAgo.toISOString() } } },
        { commit: { author: { date: sixMonthsAgo.toISOString() } } },
      ],
      issuesData: [
        {
          created_at: sixMonthsAgo.toISOString(),
          state: "closed",
          closed_at: sixMonthsAgo.toISOString(),
        },
      ],
      contributorsData: [],
    };

    const result = calculateResponsiveness(metrics);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(1);
  });
});
