// logger.test.ts

// Mock 'fs' module before importing it
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  truncateSync: jest.fn(),
  appendFileSync: jest.fn(),
  // Include any other fs methods you need to mock
}));

// logger.test.ts

import * as fs from 'fs';
import { Logger } from 'tslog';

jest.mock('fs');
jest.mock('tslog');

describe('Logger Module', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let mockExit: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    // Backup the original environment variables
    originalEnv = { ...process.env };
    jest.resetModules();
    jest.clearAllMocks();
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore the original environment variables
    process.env = originalEnv;
    mockExit.mockRestore();
    mockConsoleError.mockRestore();
  });

  it('should exit if LOG_FILE is not set', () => {
    // Arrange
    delete process.env.LOG_FILE;

    // Act & Assert
    expect(() => {
      require('../src/logger');
    }).toThrow('process.exit called');

    expect(mockConsoleError).toHaveBeenCalledWith('LOG_FILE does not exist or is not set');
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should exit if LOG_FILE does not exist', () => {
    // Arrange
    process.env.LOG_FILE = '/path/to/nonexistent/logfile.log';
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    // Act & Assert
    expect(() => {
      require('../src/logger');
    }).toThrow('process.exit called');

    expect(mockConsoleError).toHaveBeenCalledWith('LOG_FILE does not exist or is not set');
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should set log level to INFO when LOG_LEVEL is set to INFO', () => {
    // Arrange
    process.env.LOG_FILE = '/path/to/logfile.log';
    process.env.LOG_LEVEL = '1'; // INFO level
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.truncateSync as jest.Mock).mockImplementation(() => {});
    (fs.appendFileSync as jest.Mock).mockImplementation(() => {});
    const attachTransportMock = jest.fn();
    (Logger.prototype.attachTransport as jest.Mock) = attachTransportMock;

    // Act
    const loggerModule = require('../src/logger');
    const log = loggerModule.log;

    // Assert
    expect(log.settings.minLevel).toBe(3); // INFO level
    expect(fs.truncateSync).toHaveBeenCalledWith(process.env.LOG_FILE, 0);
    expect(attachTransportMock).toHaveBeenCalled();
  });

  it('should set log level to DEBUG when LOG_LEVEL is set to DEBUG', () => {
    // Arrange
    process.env.LOG_FILE = '/path/to/logfile.log';
    process.env.LOG_LEVEL = '2'; // DEBUG level
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.truncateSync as jest.Mock).mockImplementation(() => {});
    (fs.appendFileSync as jest.Mock).mockImplementation(() => {});
    const attachTransportMock = jest.fn();
    (Logger.prototype.attachTransport as jest.Mock) = attachTransportMock;

    // Act
    const loggerModule = require('../src/logger');
    const log = loggerModule.log;

    // Assert
    expect(log.settings.minLevel).toBe(2); // DEBUG level
    expect(fs.truncateSync).toHaveBeenCalledWith(process.env.LOG_FILE, 0);
    expect(attachTransportMock).toHaveBeenCalled();
  });

  it('should set log level to SILENT when LOG_LEVEL is not set', () => {
    // Arrange
    process.env.LOG_FILE = '/path/to/logfile.log';
    delete process.env.LOG_LEVEL;
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.truncateSync as jest.Mock).mockImplementation(() => {});
    (fs.appendFileSync as jest.Mock).mockImplementation(() => {});
    const attachTransportMock = jest.fn();
    (Logger.prototype.attachTransport as jest.Mock) = attachTransportMock;

    // Act
    const loggerModule = require('../src/logger');
    const log = loggerModule.log;

    // Assert
    expect(log.settings.minLevel).toBe(7); // SILENT level
    expect(fs.truncateSync).toHaveBeenCalledWith(process.env.LOG_FILE, 0);
    expect(attachTransportMock).toHaveBeenCalled();
  });

  it('should log messages to the log file', () => {
    // Arrange
    process.env.LOG_FILE = '/path/to/logfile.log';
    process.env.LOG_LEVEL = '1'; // INFO level
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.truncateSync as jest.Mock).mockImplementation(() => {});
    const appendFileSyncMock = (fs.appendFileSync as jest.Mock).mockImplementation(() => {});
    const attachTransportMock = jest.fn();
    (Logger.prototype.attachTransport as jest.Mock) = attachTransportMock;

    // Act
    const loggerModule = require('../src/logger');
    const log = loggerModule.log;

    log.info('Test message');

    // Assert
    expect(fs.truncateSync).toHaveBeenCalledWith(process.env.LOG_FILE, 0);
    expect(appendFileSyncMock).toHaveBeenCalled();
    expect(attachTransportMock).toHaveBeenCalled();
  });
});
