import {
  extractOwnerAndRepo,
  checkUrlType,
  convertSshToHttps,
  extractPackageNameFromUrl,
  processUrl,
  UrlType,
} from "../src/utils/urlUtils";
import { getGitHubRepoFromNpmUrl } from "../src/apiProcess/npmApiProcess";
import { log } from "../src/logger";

// Mock the logger to avoid actual logging during tests
jest.mock("../src/logger", () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock the getGitHubRepoFromNpmUrl function
jest.mock("../src/apiProcess/npmApiProcess");

describe("urlUtils", () => {
  describe("extractOwnerAndRepo", () => {
    it("should extract owner and repo from a valid GitHub URL", () => {
      const gitHubUrl = "https://github.com/owner/repo";
      const result = extractOwnerAndRepo(gitHubUrl);
      expect(result).toEqual({ owner: "owner", repo: "repo" });
    });

    it("should exit with return code 1 for invalid owner and repo", async () => {
      const gitHubUrl = "https://github.com/invalid-url";
      const exitSpy = jest.spyOn(process, "exit").mockImplementation((code) => {
        throw new Error(`process.exit: ${code}`);
      });
      await expect(() => extractOwnerAndRepo(gitHubUrl)).toThrow(
        "process.exit: 1",
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
      exitSpy.mockRestore();
    });
  });

  describe("checkUrlType", () => {
    it("should identify a GitHub URL", () => {
      const url = "https://github.com/owner/repo";
      const result = checkUrlType(url);
      expect(result).toBe(UrlType.GitHub);
    });

    it("should identify an npm URL", () => {
      const url = "https://www.npmjs.com/package/package-name";
      const result = checkUrlType(url);
      expect(result).toBe(UrlType.npm);
    });

    it("should identify an invalid URL", () => {
      const url = "https://invalid-url.com";
      const result = checkUrlType(url);
      expect(result).toBe(UrlType.Invalid);
    });
  });

  describe("convertSshToHttps", () => {
    it("should convert a GitHub SSH URL to HTTPS", () => {
      const sshUrl = "git@github.com:owner/repo.git";
      const result = convertSshToHttps(sshUrl);
      expect(result).toBe("https://github.com/owner/repo");
    });

    it("should return the original URL if it is not an SSH URL", () => {
      const sshUrl = "https://github.com/owner/repo";
      const result = convertSshToHttps(sshUrl);
      expect(result).toBe(sshUrl);
    });
  });

  describe("extractPackageNameFromUrl", () => {
    it("should extract npm package name from a valid npm URL", () => {
      const url = "https://www.npmjs.com/package/package-name";
      const result = extractPackageNameFromUrl(url);
      expect(result).toBe("package-name");
    });

    it("should extract GitHub repo name from a valid GitHub URL", () => {
      const url = "https://github.com/owner/repo";
      const result = extractPackageNameFromUrl(url);
      expect(result).toBe("repo");
    });

    it("should exit with rc1 for invalid URL", async () => {
      const url = "https://invalid-url.com";
      const exitSpy = jest.spyOn(process, "exit").mockImplementation((code) => {
        throw new Error(`process.exit: ${code}`);
      });
      await expect(() => extractPackageNameFromUrl(url)).toThrow(
        "process.exit: 1",
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
      exitSpy.mockRestore();
    });
  });

  describe("processUrl", () => {
    it("should process a GitHub URL and return owner and repo", async () => {
      const url = "https://github.com/owner/repo";
      const result = await processUrl(UrlType.GitHub, url);
      expect(result).toEqual({ owner: "owner", repo: "repo" });
    });

    it("should process an npm URL and return owner and repo", async () => {
      const url = "https://www.npmjs.com/package/package-name";
      (getGitHubRepoFromNpmUrl as jest.Mock).mockResolvedValue(
        "git@github.com:owner/repo.git",
      );
      const result = await processUrl(UrlType.npm, url);
      expect(result).toEqual({ owner: "owner", repo: "repo" });
    });

    it("should return with rc1 for an invalid URL type", async () => {
      const url = "https://invalid-url.com";
      const exitSpy = jest.spyOn(process, "exit").mockImplementation((code) => {
        throw new Error(`process.exit: ${code}`);
      });
      await expect(processUrl(UrlType.Invalid, url)).rejects.toThrow(
        "process.exit: 1",
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
      exitSpy.mockRestore();
    });
  });
});
