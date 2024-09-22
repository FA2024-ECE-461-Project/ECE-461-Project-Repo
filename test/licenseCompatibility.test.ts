import { calculateLicenseCompatibility } from "../src/metrics/licenseCompatibility";
import { log } from "../src/logger";
import { RepoDetails } from "../src/apiProcess/gitApiProcess";

// Mock the logger
jest.mock("../src/logger", () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe("calculateLicenseCompatibility", () => {
  const { log } = require("../src/logger");

  beforeEach(() => {
    jest.clearAllMocks(); // Clear any previous mock calls
  });

  it("should return correct score for a valid license (MIT)", () => {
    const repoDetails: RepoDetails = {
      license: "MIT",
      owner: "",
      repo: "",
      createdAt: "",
      stars: 0,
      openIssues: 0,
      forks: 0,
      commitsData: [],
      issuesData: [],
      contributorsData: [],
    };

    const score = calculateLicenseCompatibility(repoDetails);

    expect(score).toBe(1); // MIT license should return 1
    expect(log.info).toHaveBeenCalledWith(
      "Calculating license compatibility...",
    );
    expect(log.info).toHaveBeenCalledWith(
      "Finished calculating license compatibility. Exiting...",
    );
  });

  it("should return correct score for a valid license (Apache-2.0)", () => {
    const repoDetails: RepoDetails = {
      license: "Apache-2.0",
      owner: "",
      repo: "",
      createdAt: "",
      stars: 0,
      openIssues: 0,
      forks: 0,
      commitsData: [],
      issuesData: [],
      contributorsData: [],
    };

    const score = calculateLicenseCompatibility(repoDetails);

    expect(score).toBe(0.5); // Apache-2.0 license should return 0.5
    expect(log.info).toHaveBeenCalledWith(
      "Calculating license compatibility...",
    );
    expect(log.info).toHaveBeenCalledWith(
      "Finished calculating license compatibility. Exiting...",
    );
  });

  it("should return 0 for an invalid or unknown license", () => {
    const repoDetails: RepoDetails = {
      license: "Unknown-License",
      owner: "",
      repo: "",
      createdAt: "",
      stars: 0,
      openIssues: 0,
      forks: 0,
      commitsData: [],
      issuesData: [],
      contributorsData: [],
    };

    const score = calculateLicenseCompatibility(repoDetails);

    expect(score).toBe(0); // Unknown license should return 0
    expect(log.info).toHaveBeenCalledWith(
      "Calculating license compatibility...",
    );
    expect(log.info).toHaveBeenCalledWith("No valid license found. Exiting...");
  });
});
