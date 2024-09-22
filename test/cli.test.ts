import { cli } from "../src/cli";
import { checkUrlType, processUrl } from "../src/utils/urlUtils";
import { readUrlsFromFile } from "../src/utils/fileUtils";
import { GetNetScore } from "../src/metrics/netScore";
import { log } from "../src/logger";

jest.mock("../src/utils/urlUtils");
jest.mock("../src/utils/fileUtils");
jest.mock("../src/metrics/netScore");
jest.mock("../src/logger");

describe("cli", () => {
  const originalArgv = process.argv;
  const originalExit = process.exit;
  const originalConsoleLog = console.log;

  beforeEach(() => {
    jest.clearAllMocks();
    process.exit = jest.fn() as any;
    console.log = jest.fn();
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.exit = originalExit;
    console.log = originalConsoleLog;
  });

  it("should log error and exit if no file path is provided", async () => {
    process.argv = ["node", "cli.js"];

    await cli();

    expect(log.error).toHaveBeenCalledWith("Usage: ./run FILE_PATH");
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("should log error and exit if file cannot be read", async () => {
    process.argv = ["node", "cli.js", "test.txt"];
    (readUrlsFromFile as jest.Mock).mockRejectedValue(
      new Error("File read error"),
    );

    await cli();

    expect(log.error).toHaveBeenCalledWith(
      "Unable to read URLs from file test.txt",
      expect.any(Error),
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("should log error and exit if URL processing fails", async () => {
    process.argv = ["node", "cli.js", "test.txt"];
    (readUrlsFromFile as jest.Mock).mockResolvedValue([
      "https://github.com/user/repo",
    ]);
    (checkUrlType as jest.Mock).mockReturnValue("github");
    (processUrl as jest.Mock).mockRejectedValue(
      new Error("URL processing error"),
    );

    await cli();

    expect(log.error).toHaveBeenCalledWith(
      "Error processing URL https://github.com/user/repo:",
      expect.any(Error),
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("should process URLs and log metrics", async () => {
    process.argv = ["node", "cli.js", "test.txt"];
    const mockMetrics = { score: 100 };
    (readUrlsFromFile as jest.Mock).mockResolvedValue([
      "https://github.com/user/repo",
    ]);
    (checkUrlType as jest.Mock).mockReturnValue("github");
    (processUrl as jest.Mock).mockResolvedValue({
      owner: "user",
      repo: "repo",
    });
    (GetNetScore as jest.Mock).mockResolvedValue(mockMetrics);

    await cli();

    expect(log.info).toHaveBeenCalledWith("Reading URLs from file: test.txt");
    expect(log.info).toHaveBeenCalledWith(
      "Processing URL: https://github.com/user/repo",
    );
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify(mockMetrics, null, 2),
    );
  });
});
