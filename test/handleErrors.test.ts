import axios, { AxiosError, isAxiosError, AxiosResponse } from "axios";
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { _handleError } from "../src/apiProcess/gitApiProcess";

describe("_handleError", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle rate limit exceeded error (403)", async () => {
    const error: AxiosError = new AxiosError(
      "Rate limit exceeded",
      "403",
      undefined,
      {
        url: "https://api.example.com/resource",
        method: "get",
        headers: {
          "Content-Type": "application/json",
          "x-rate-limit-limit": "60",
          "x-rate-limit-remaining": "0",
          "x-rate-limit-reset": "1377013266",
        },
      } as AxiosRequestConfig,
      {
        data: {
          message: "Rate limit exceeded",
        },
        status: 403,
        statusText: "Forbidden",
        headers: {
          "Content-Type": "application/json",
          "x-ratelimit-limit": "60",
          "x-ratelimit-remaining": "0",
          "x-ratelimit-reset": "1377013266",
        },
        config: {} as InternalAxiosRequestConfig,
        request: {},
      } as AxiosResponse,
    );
    const context = "Rate limit test";
    const exitSpy = jest.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`);
    });
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(() => _handleError(error, context)).toThrow("process.exit: 1");
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Rate limit exceeded"),
    );

    exitSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should handle invalid or missing GitHUb Token error (401)", async () => {
    const error: AxiosError = new AxiosError(
      "Invalid token",
      "401",
      undefined,
      {
        url: "https://api.example.com/resource",
        method: "get",
        headers: {},
      } as AxiosRequestConfig,
      {
        data: {
          message: "Invalid token",
        },
        status: 401,
        statusText: "Invalid token",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
        request: {},
      } as AxiosResponse,
    );
    const context = "Invalid token test";
    const exitSpy = jest.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`);
    });
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(() => _handleError(error, context)).toThrow("process.exit: 1");
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Error: Unauthorized. Invalid or missing GitHub Token.",
      ),
    );

    exitSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should handle invalid URL (404)", async () => {
    const error: AxiosError = new AxiosError(
      "invalid URL",
      "404",
      undefined,
      {
        url: "https://api.example.com/resource",
        method: "get",
        headers: {},
      } as AxiosRequestConfig,
      {
        data: {
          message: "invalid URL",
        },
        status: 404,
        statusText: "invalid URL",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
        request: {},
      } as AxiosResponse,
    );
    const context = "Invalid URL Test";
    const exitSpy = jest.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`);
    });
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(() => _handleError(error, context)).toThrow("process.exit: 1");
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error: Not Found. Invalid URL."),
    );

    exitSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should handle between 400 and 500 (406)", async () => {
    const error: AxiosError = new AxiosError(
      "Clien Error",
      "406",
      undefined,
      {
        url: "https://api.example.com/resource",
        method: "get",
        headers: {},
      } as AxiosRequestConfig,
      {
        data: {
          message: "Client Error",
        },
        status: 406,
        statusText: "Client Error",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
        request: {},
      } as AxiosResponse,
    );
    const context = "Client Error Test";
    const exitSpy = jest.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`);
    });
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(() => _handleError(error, context)).toThrow("process.exit: 1");
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("406"),
    );

    exitSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should handle between 500 and 600 (506)", async () => {
    const error: AxiosError = new AxiosError(
      "Server Error",
      "506",
      undefined,
      {
        url: "https://api.example.com/resource",
        method: "get",
        headers: {},
      } as AxiosRequestConfig,
      {
        data: {
          message: "Server Error",
        },
        status: 506,
        statusText: "Server Error",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
        request: {},
      } as AxiosResponse,
    );
    const context = "Server Error Test";
    const exitSpy = jest.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`);
    });
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(() => _handleError(error, context)).toThrow("process.exit: 1");
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("506"),
    );

    exitSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should handle unknown error", async () => {
    const error = new Error("Unknown Error");
    const context = "Unknown Error Test";
    const exitSpy = jest.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`);
    });
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(() => _handleError(error, context)).toThrow("process.exit: 1");
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
