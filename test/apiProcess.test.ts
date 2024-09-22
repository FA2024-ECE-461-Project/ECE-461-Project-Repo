import { getGithubInfo } from "../src/apiProcess/gitApiProcess";
import axios from "axios";
import { log } from "../src/logger";

jest.mock("axios");
jest.mock('../src/logger', () => ({
  log: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  },
}));

const exitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
throw new Error(`process.exit: ${code}`);
});

describe("getGithubInfo", () => {
  const owner = "testOwner";
  const repo = "testRepo";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch repository details successfully", async () => {
    const repoData = {
      createdAt: "2022-01-01T00:00:00Z",
      stargazers_count: 100,
      forks_count: 50,
      license: { name: "MIT" },
    };

    const commitsData = [
      { commit: { author: { date: "2022-01-01T00:00:00Z" } } },
    ];

    const issuesData = [
      { createdAt: "2022-01-01T00:00:00Z" },
    ];

    const contributorsData = {
      data: [{ login: "contributor1" }],
    };

    (axios.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/repos/")) {
        return Promise.resolve({ data: repoData });
      } else if (url.includes("/commits")) {
        return Promise.resolve({ data: commitsData });
      } else if (url.includes("/issues")) {
        return Promise.resolve({ data: issuesData });
      } else if (url.includes("/stats/contributors")) {
        return Promise.resolve(contributorsData);
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const result = await getGithubInfo(owner, repo);

    expect(result).toEqual({
      owner: owner,
      repo: repo,
      createdAt: repoData.createdAt,
      stars: repoData.stargazers_count,
      openIssues: issuesData.length,
      forks: repoData.forks_count,
      license: repoData.license.name,
      commitsData: commitsData,
      issuesData: issuesData,
      contributorsData: contributorsData.data,
    });

    expect(log.info).toHaveBeenCalledWith(`Entering getGithubInfo for ${owner}/${repo}`);
    expect(log.info).toHaveBeenCalledWith(`Exiting getGithubInfo for ${owner}/${repo}`);
  });

  it("should handle errors gracefully", async () => {
    (axios.get as jest.Mock).mockRejectedValue(exitSpy);

    await expect(getGithubInfo(owner, repo)).rejects.toThrow("API Error");

    expect(log.info).toHaveBeenCalledWith(`Entering getGithubInfo for ${owner}/${repo}`);
  });
});