// NpmApiProcess.test.ts

import axios from "axios";
import {
  getGitHubRepoFromNpmUrl,
  getNpmPackageInfo,
  packageInfo,
} from "../src/apiProcess/npmApiProcess";
import { log } from "../src/logger";

jest.mock("axios");
jest.mock("../src/logger");

describe("getGitHubRepoFromNpmUrl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the GitHub repository URL when it is available", async () => {
    // Arrange
    const packageName = "some-package";
    const mockRepositoryUrl = "git+https://github.com/user/repo.git";
    const expectedUrl = "https://github.com/user/repo";

    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        repository: {
          url: mockRepositoryUrl,
        },
      },
    });

    // Act
    const result = await getGitHubRepoFromNpmUrl(packageName);

    // Assert
    expect(result).toBe(expectedUrl);
    expect(axios.get).toHaveBeenCalledWith(
      `https://registry.npmjs.org/${packageName}`,
    );
    expect(log.info).toHaveBeenCalledWith(
      `Fetching GitHub repository URL for package: ${packageName}`,
    );
    expect(log.debug).toHaveBeenCalledWith(
      `Received response from npm registry for ${packageName}`,
    );
    expect(log.info).toHaveBeenCalledWith(
      `GitHub repository URL found for ${packageName}: ${expectedUrl}`,
    );
  });

  it("should exit the process when the repository URL is not available", async () => {
    // Arrange
    const packageName = "some-package";

    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        // No repository field
      },
    });

    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit was called");
    });
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Act & Assert
    await expect(getGitHubRepoFromNpmUrl(packageName)).rejects.toThrow(
      "process.exit was called",
    );

    expect(axios.get).toHaveBeenCalledWith(
      `https://registry.npmjs.org/${packageName}`,
    );
    expect(console.error).toHaveBeenCalledWith(
      `GitHub repository URL not found in package metadata for ${packageName}`,
    );
    expect(mockExit).toHaveBeenCalledWith(1);

    mockExit.mockRestore();
    (console.error as jest.Mock).mockRestore();
  });

  it("should handle axios errors and exit the process", async () => {
    // Arrange
    const packageName = "some-package";
    const errorMessage = "Network Error";

    (axios.get as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit was called");
    });
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Act & Assert
    await expect(getGitHubRepoFromNpmUrl(packageName)).rejects.toThrow(
      "process.exit was called",
    );

    expect(axios.get).toHaveBeenCalledWith(
      `https://registry.npmjs.org/${packageName}`,
    );
    expect(console.error).toHaveBeenCalledWith(
      `getGitHubRepoFromNpmUrl: Failed to fetch data for ${packageName}:`,
      expect.any(Error),
    );
    expect(mockExit).toHaveBeenCalledWith(1);

    mockExit.mockRestore();
    (console.error as jest.Mock).mockRestore();
  });
});

describe("getNpmPackageInfo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return package info when data is available", async () => {
    // Arrange
    const packageName = "some-package";
    const mockData = {
      license: "MIT",
      description: "A sample package",
      maintainers: [{ name: "maintainer1" }, { name: "maintainer2" }],
      contributors: [{ name: "contributor1" }],
    };
    const expectedPackageInfo: packageInfo = {
      license: "MIT",
      description: "A sample package",
      numberOfMaintainers: 2,
      numberOfContributors: 1,
    };

    (axios.get as jest.Mock).mockResolvedValue({
      data: mockData,
    });

    // Act
    const result = await getNpmPackageInfo(packageName);

    // Assert
    expect(result).toEqual(expectedPackageInfo);
    expect(axios.get).toHaveBeenCalledWith(
      `https://registry.npmjs.org/${packageName}`,
    );
    expect(log.info).toHaveBeenCalledWith(
      `Fetching npm package info for ${packageName}`,
    );
    expect(log.debug).toHaveBeenCalledWith(
      `Received npm package metadata for ${packageName}`,
    );
    expect(log.info).toHaveBeenCalledWith(
      `Successfully fetched package info for ${packageName}`,
    );
    expect(log.debug).toHaveBeenCalledWith(
      `Package Info: ${JSON.stringify(expectedPackageInfo)}`,
    );
  });

  it("should handle missing fields and provide default values", async () => {
    // Arrange
    const packageName = "some-package";
    const mockData = {
      // No license, description, maintainers, contributors
    };
    const expectedPackageInfo: packageInfo = {
      license: "No license",
      description: "No description",
      numberOfMaintainers: 0,
      numberOfContributors: 0,
    };

    (axios.get as jest.Mock).mockResolvedValue({
      data: mockData,
    });

    // Act
    const result = await getNpmPackageInfo(packageName);

    // Assert
    expect(result).toEqual(expectedPackageInfo);
    expect(axios.get).toHaveBeenCalledWith(
      `https://registry.npmjs.org/${packageName}`,
    );
    expect(log.info).toHaveBeenCalledWith(
      `Fetching npm package info for ${packageName}`,
    );
    expect(log.debug).toHaveBeenCalledWith(
      `Received npm package metadata for ${packageName}`,
    );
    expect(log.info).toHaveBeenCalledWith(
      `Successfully fetched package info for ${packageName}`,
    );
    expect(log.debug).toHaveBeenCalledWith(
      `Package Info: ${JSON.stringify(expectedPackageInfo)}`,
    );
  });

  it("should handle errors and return default package info", async () => {
    // Arrange
    const packageName = "some-package";
    const errorMessage = "Network Error";
    const expectedPackageInfo: packageInfo = {
      license: "No license",
      description: "No description",
      numberOfMaintainers: 0,
      numberOfContributors: 0,
    };

    (axios.get as jest.Mock).mockRejectedValue(new Error(errorMessage));

    // Act
    const result = await getNpmPackageInfo(packageName);

    // Assert
    expect(result).toEqual(expectedPackageInfo);
    expect(axios.get).toHaveBeenCalledWith(
      `https://registry.npmjs.org/${packageName}`,
    );
    expect(log.error).toHaveBeenCalledWith(
      `getNpmPackageInfo: Failed to fetch data for ${packageName}:`,
      expect.any(Error),
    );
  });
});
