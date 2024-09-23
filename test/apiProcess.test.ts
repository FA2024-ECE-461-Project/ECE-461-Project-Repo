import axios, { AxiosError, isAxiosError } from "axios";
import { log } from "../src/logger";
import {
  _fetchRepoData,
  _fetchLicense,
  _fetchLatestCommits,
  _fetchLatestIssues,
  _fetchContributors,
  _handleError,
} from "../src/apiProcess/gitApiProcess";

// Mock axios and logger
jest.mock("axios", () => ({
  get: jest.fn(),
}));
jest.mock("../src/logger", () => ({
  log: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

describe("GitHub API Process Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("_fetchRepoData", () => {
    it("should fetch repository data successfully", async () => {
      const mockRepoData = { name: "mockRepo", owner: { login: "mockOwner" } };
      (axios.get as jest.Mock).mockResolvedValue({ data: mockRepoData });

      const result = await _fetchRepoData("mockOwner", "mockRepo");
      expect(result).toEqual(mockRepoData);
      expect(axios.get).toHaveBeenCalledWith(
        "https://api.github.com/repos/mockOwner/mockRepo",
        { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } },
      );
    });
  });

  describe("_fetchLicense", () => {
    it("should fetch license information successfully", async () => {
      const mockRepoData = { license: { name: "MIT" } };
      const result = await _fetchLicense(mockRepoData, "mockOwner", "mockRepo");
      expect(result).toBe("MIT");
    });

    it("should handle no license scenario", async () => {
      const mockRepoData = { license: null };
      (axios.get as jest.Mock).mockResolvedValue({
        data: { content: Buffer.from("MIT License").toString("base64") },
      });

      const result = await _fetchLicense(mockRepoData, "mockOwner", "mockRepo");
      expect(result).toBe("MIT License");
    });
  });

  describe("_fetchLatestCommits", () => {
    it("should fetch latest commits successfully", async () => {
      const mockCommits = [
        { commit: { author: { date: "2022-01-01T00:00:00Z" } } },
      ];
      (axios.get as jest.Mock).mockResolvedValue({ data: mockCommits });

      const result = await _fetchLatestCommits(
        "mockOwner",
        "mockRepo",
        new Date("2021-01-01T00:00:00Z"),
        100,
        1,
      );
      expect(result).toEqual(mockCommits);
      expect(axios.get).toHaveBeenCalledWith(
        "https://api.github.com/repos/mockOwner/mockRepo/commits",
        {
          params: {
            per_page: 100,
            page: 1,
            since: new Date("2021-01-01T00:00:00Z").toISOString(),
          },
          headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` },
        },
      );
    });
  });

  describe("_fetchLatestIssues", () => {
    it("should fetch latest issues successfully", async () => {
      const mockIssues = [{ createdAt: "2022-01-01T00:00:00Z" }];
      (axios.get as jest.Mock).mockResolvedValue({ data: mockIssues });

      const result = await _fetchLatestIssues(
        "mockOwner",
        "mockRepo",
        100,
        1,
        new Date("2021-01-01T00:00:00Z"),
      );
      expect(result).toEqual(mockIssues);
      expect(axios.get).toHaveBeenCalledWith(
        "https://api.github.com/repos/mockOwner/mockRepo/issues",
        {
          params: {
            state: "all",
            per_page: 100,
            page: 1,
            since: new Date("2021-01-01T00:00:00Z"),
          },
          headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` },
        },
      );
    });
  });

  describe("_fetchContributors", () => {
    it("should fetch contributors successfully", async () => {
      const mockContributors = [{ login: "contributor1" }];
      (axios.get as jest.Mock).mockResolvedValue(mockContributors);

      const result = await _fetchContributors("mockOwner", "mockRepo");
      expect(result).toEqual(mockContributors);
      expect(axios.get).toHaveBeenCalledWith(
        "https://api.github.com/repos/mockOwner/mockRepo/stats/contributors",
        { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } },
      );
    });
  });
});
