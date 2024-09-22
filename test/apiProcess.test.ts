import axios, { AxiosError, isAxiosError } from 'axios';
import { log } from '../src/logger';
import {
  _fetchRepoData,
  _fetchLicense,
  _fetchLatestCommits,
  _fetchLatestIssues,
  _fetchContributors,
  _handleError,
} from '../src/apiProcess/gitApiProcess';

// Mock axios and logger
jest.mock('axios');
jest.mock('../src/logger', () => ({
  log: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

describe('GitHub API Process Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('_fetchRepoData', () => {
    it('should fetch repository data successfully', async () => {
      const mockRepoData = { name: 'mockRepo', owner: { login: 'mockOwner' } };
      (axios.get as jest.Mock).mockResolvedValue({ data: mockRepoData });

      const result = await _fetchRepoData('mockOwner', 'mockRepo');
      expect(result).toEqual(mockRepoData);
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.github.com/repos/mockOwner/mockRepo',
        { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
      );
    }); 
  });

  describe('_fetchLicense', () => {
    it('should fetch license information successfully', async () => {
      const mockRepoData = { license: { name: 'MIT' } };
      const result = await _fetchLicense(mockRepoData, 'mockOwner', 'mockRepo');
      expect(result).toBe('MIT');
    });

    it('should handle no license scenario', async () => {
      const mockRepoData = { license: null };
      (axios.get as jest.Mock).mockResolvedValue({
        data: { content: Buffer.from('MIT License').toString('base64') },
      });

      const result = await _fetchLicense(mockRepoData, 'mockOwner', 'mockRepo');
      expect(result).toBe('MIT License');
    });

  });

  describe('_fetchLatestCommits', () => {
    it('should fetch latest commits successfully', async () => {
      const mockCommits = [{ commit: { author: { date: '2022-01-01T00:00:00Z' } } }];
      (axios.get as jest.Mock).mockResolvedValue({ data: mockCommits });

      const result = await _fetchLatestCommits(
        'mockOwner',
        'mockRepo',
        new Date('2021-01-01T00:00:00Z'),
        100,
        1
      );
      expect(result).toEqual(mockCommits);
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.github.com/repos/mockOwner/mockRepo/commits',
        {
          params: {
            per_page: 100,
            page: 1,
            since: new Date('2021-01-01T00:00:00Z').toISOString(),
          },
          headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` },
        }
      );
    });
  });

  describe('_fetchLatestIssues', () => {
    it('should fetch latest issues successfully', async () => {
      const mockIssues = [{ createdAt: '2022-01-01T00:00:00Z' }];
      (axios.get as jest.Mock).mockResolvedValue({ data: mockIssues });

      const result = await _fetchLatestIssues(
        'mockOwner',
        'mockRepo',
        100,
        1,
        new Date('2021-01-01T00:00:00Z')
      );
      expect(result).toEqual(mockIssues);
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.github.com/repos/mockOwner/mockRepo/issues',
        {
          params: {
            state: 'all',
            per_page: 100,
            page: 1,
            since: new Date('2021-01-01T00:00:00Z'),
          },
          headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` },
        }
      );
    });
  });

  describe('_fetchContributors', () => {
    it('should fetch contributors successfully', async () => {
      const mockContributors = [{ login: 'contributor1' }];
      (axios.get as jest.Mock).mockResolvedValue(mockContributors);

      const result = await _fetchContributors('mockOwner', 'mockRepo');
      expect(result).toEqual(mockContributors);
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.github.com/repos/mockOwner/mockRepo/stats/contributors',
        { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
      );
    });
  });
});


/*describe('_handleError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /*it('should handle rate limit exceeded error (403)', async () => {
    const error = {
      response: {
        status: 403,
        headers: {
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': (Date.now() / 1000 + 60).toString(), // 1 minute later
        },
      },
    };
    const context = 'Rate limit test';

    (axios.get as jest.Mock).mockRejectedValue(error);

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`);
    });

    await expect(_fetchRepoData('mockOwner', 'mockRepo')).rejects.toThrow('process.exit: 1');
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
    expect(log.info).toHaveBeenCalledWith('Exiting Error Handling...');
  });

  it('should handle invalid or missing GitHub Token error (401)', async () => {
    const error = {
      response: {
        status: 401,
      },
    };
    const context = 'Rate limit test';

    (axios.get as jest.Mock).mockRejectedValue(error);

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`);
    });

    await expect(_fetchRepoData('mockOwner', 'mockRepo')).rejects.toThrow('process.exit: 1');
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
    expect(log.info).toHaveBeenCalledWith('Exiting Error Handling...');
  });

  it('should handle rate limit exceeded error (403)', async () => {
    /*const error: AxiosError = {
      isAxiosError: true,
      response: {
        status: 403,
        statusText: 'Forbidden',
        headers: {
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': (Date.now() / 1000 + 60).toString(), // 1 minute later
        },
        data: {},
        config: { headers: { common: {} } as AxiosRequestHeaders }, // Add the config property with headers
      },
      code: 'ERR_BAD_REQUEST',
      message: 'Request failed with status code 429',
      name: 'AxiosError',
    };
    const error: AxiosError = new Error() as AxiosError;
    error.isAxiosError = true;
    error.response = {
      status: 403,
      statusText: 'Forbidden',
      headers: {
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': (Date.now() / 1000 + 60).toString(), // 1 minute later
      },
      data: {},
      config: { headers: { common: {} } as any }, // Add the config property with headers
    };
    const context = 'Rate limit test';

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`);
    });
    await expect(() =>  _handleError(error, context)).toThrow('process.exit: 1');
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
    expect(log.info).toHaveBeenCalledWith('Exiting Error Handling...');
  });

  /*it('should handle unauthorized error (401)', () => {
    const error = {
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };
    const context = 'Unauthorized test';

    _handleError(error, context);

    expect(log.info).toHaveBeenCalledWith('Error occured in context: Unauthorized test');
    expect(log.info).toHaveBeenCalledWith('Processing error...');
    expect(console.error).toHaveBeenCalledWith('Error: Unauthorized. Invalid or missing GitHub Token.');
    expect(console.error).toHaveBeenCalledWith('Context:', context);
    expect(log.info).toHaveBeenCalledWith('Exiting errorhandling...');
  });

  it('should handle forbidden error (403)', () => {
    const error = {
      response: {
        status: 403,
        statusText: 'Forbidden',
      },
    };
    const context = 'Forbidden test';

    _handleError(error, context);

    expect(log.info).toHaveBeenCalledWith('Error occured in context: Forbidden test');
    expect(log.info).toHaveBeenCalledWith('Processing error...');
    expect(console.error).toHaveBeenCalledWith('Error: Forbidden. You do not have permission to access this resource.');
    expect(console.error).toHaveBeenCalledWith('Context:', context);
    expect(log.info).toHaveBeenCalledWith('Exiting errorhandling...');
  });

  it('should handle not found error (404)', () => {
    const error = {
      response: {
        status: 404,
        statusText: 'Not Found',
      },
    };
    const context = 'Not Found test';

    _handleError(error, context);

    expect(log.info).toHaveBeenCalledWith('Error occured in context: Not Found test');
    expect(log.info).toHaveBeenCalledWith('Processing error...');
    expect(console.error).toHaveBeenCalledWith('Error: Not Found. Invalid URL.');
    expect(console.error).toHaveBeenCalledWith('Context:', context);
    expect(log.info).toHaveBeenCalledWith('Exiting errorhandling...');
  });

  it('should handle client error (400)', () => {
    const error = {
      response: {
        status: 400,
        statusText: 'Bad Request',
      },
    };
    const context = 'Client error test';

    _handleError(error, context);

    expect(log.info).toHaveBeenCalledWith('Error occured in context: Client error test');
    expect(log.info).toHaveBeenCalledWith('Processing error...');
    expect(console.error).toHaveBeenCalledWith('Client error: 400 - Bad Request');
    expect(console.error).toHaveBeenCalledWith('Context:', context);
    expect(log.info).toHaveBeenCalledWith('Exiting errorhandling...');
  });

  it('should handle server error (500)', () => {
    const error = {
      response: {
        status: 500,
        statusText: 'Internal Server Error',
      },
    };
    const context = 'Server error test';

    _handleError(error, context);

    expect(log.info).toHaveBeenCalledWith('Error occured in context: Server error test');
    expect(log.info).toHaveBeenCalledWith('Processing error...');
    expect(console.error).toHaveBeenCalledWith('Server error: 500 - Internal Server Error');
    expect(console.error).toHaveBeenCalledWith('Context:', context);
    expect(log.info).toHaveBeenCalledWith('Exiting errorhandling...');
  });

  it('should handle network error', () => {
    const error = {
      request: {},
    };
    const context = 'Network error test';

    _handleError(error, context);

    expect(log.info).toHaveBeenCalledWith('Error occured in context: Network error test');
    expect(log.info).toHaveBeenCalledWith('Processing error...');
    expect(console.error).toHaveBeenCalledWith('No response received:', error.request);
    expect(console.error).toHaveBeenCalledWith('Context:', context);
    expect(log.info).toHaveBeenCalledWith('Exiting errorhandling...');
  });

  it('should handle request setup error', () => {
    const error = {
      message: 'Request setup error',
    };
    const context = 'Request setup error test';

    _handleError(error, context);

    expect(log.info).toHaveBeenCalledWith('Error occured in context: Request setup error test');
    expect(log.info).toHaveBeenCalledWith('Processing error...');
    expect(console.error).toHaveBeenCalledWith('Error in request setup:', error.message);
    expect(console.error).toHaveBeenCalledWith('Context:', context);
    expect(log.info).toHaveBeenCalledWith('Exiting errorhandling...');
  });

  it('should handle non-Axios error', () => {
    const error = new Error('Non-Axios error');
    const context = 'Non-Axios error test';

    _handleError(error, context);

    expect(log.info).toHaveBeenCalledWith('Error occured in context: Non-Axios error test');
    expect(log.info).toHaveBeenCalledWith('Processing error...');
    expect(console.error).toHaveBeenCalledWith('Unexpected error:', error);
    expect(console.error).toHaveBeenCalledWith('Context:', context);
    expect(log.info).toHaveBeenCalledWith('Exiting errorhandling...');
  });
});*/