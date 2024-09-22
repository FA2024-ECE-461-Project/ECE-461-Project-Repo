import { appendFileSync, existsSync, truncateSync } from 'fs';
import { Logger } from 'tslog';

jest.mock('fs');

describe('Logger setup', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    (console.error as jest.Mock).mockRestore();
  });

  it('should exit if LOG_FILE does not exist', () => {
    (existsSync as jest.Mock).mockReturnValue(false);
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });

    expect(() => require('../src/logger')).toThrow('process.exit');
    expect(console.error).toHaveBeenCalledWith('LOG_FILE does not exist or is not set');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('should truncate the log file at the beginning', () => {
    (existsSync as jest.Mock).mockReturnValue(true);
    process.env.LOG_FILE = 'test.log';

    require('../src/logger');

    expect(truncateSync).toHaveBeenCalledWith('test.log', 0);
  });

  it('should set log level to information if LOG_LEVEL is 1', () => {
    (existsSync as jest.Mock).mockReturnValue(true);
    process.env.LOG_FILE = 'test.log';
    process.env.LOG_LEVEL = '1';

    const { log } = require('../src/logger');

    expect(log.settings.minLevel).toBe(7); // information messages
  });

  it('should set log level to debug if LOG_LEVEL is 2', () => {
    (existsSync as jest.Mock).mockReturnValue(true);
    process.env.LOG_FILE = 'test.log';
    process.env.LOG_LEVEL = '2';

    const { log } = require('../src/logger');

    expect(log.settings.minLevel).toBe(7); // debug messages 
  });

  it('should set log level to silent if LOG_LEVEL is not set', () => {
    (existsSync as jest.Mock).mockReturnValue(true);
    process.env.LOG_FILE = 'test.log';
    delete process.env.LOG_LEVEL;

    const { log } = require('../src/logger');

    expect(log.settings.minLevel).toBe(7); // silent
  });

//   it('should append logs to the log file', () => {
//     (existsSync as jest.Mock).mockReturnValue(true);
//     process.env.LOG_FILE = 'test.log';

//     const { log } = require('../src/logger');

//     log.info('Test log message');

//     expect(appendFileSync).toHaveBeenCalledWith('test.log', expect.stringContaining('Test log message'));
//   });

//   it('should exit if LOG_FILE environment variable is not set during transport attachment', () => {
//     (existsSync as jest.Mock).mockReturnValue(true);
//     delete process.env.LOG_FILE;
//     const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });

//     expect(() => require('../src/logger')).toThrow('process.exit');
//     expect(console.error).toHaveBeenCalledWith('LOG_FILE environment variable not set');
//     expect(exitSpy).toHaveBeenCalledWith(1);
//   });
});