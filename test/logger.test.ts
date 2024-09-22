// logger.test.ts

// Mock 'fs' module before importing it
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  truncateSync: jest.fn(),
  appendFileSync: jest.fn(),
  // Include any other fs methods you need to mock
}));

// logger.test.ts

import * as fs from "fs";
import { Logger } from "tslog";

jest.mock("fs");
jest.mock("tslog");

describe("Logger Module", () => {
  let originalEnv: NodeJS.ProcessEnv;
  let mockExit: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    // Backup the original environment variables
    originalEnv = { ...process.env };
    jest.resetModules();
    jest.clearAllMocks();
    mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    mockConsoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore the original environment variables
    process.env = originalEnv;
    mockExit.mockRestore();
    mockConsoleError.mockRestore();
  });

  it("should exit if LOG_FILE is not set", () => {
    // Arrange
    delete process.env.LOG_FILE;

    // Act & Assert
    expect(() => {
      require("../src/logger");
    }).toThrow("process.exit called");

    expect(mockConsoleError).toHaveBeenCalledWith(
      "LOG_FILE does not exist or is not set",
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("should exit if LOG_FILE does not exist", () => {
    // Arrange
    process.env.LOG_FILE = "/path/to/nonexistent/logfile.log";
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    // Act & Assert
    expect(() => {
      require("../src/logger");
    }).toThrow("process.exit called");

    expect(mockConsoleError).toHaveBeenCalledWith(
      "LOG_FILE does not exist or is not set",
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
