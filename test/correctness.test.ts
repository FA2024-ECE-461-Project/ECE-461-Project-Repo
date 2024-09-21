import { calculateCorrectness } from "../src/metrics/correctness";
import { RepoDetails, getGithubInfo } from "../src/apiProcess/gitApiProcess";
import mock from 'mock-fs';
import * as fs from 'fs';
import { __findSrc, __findTest, __countFilesInDirectory } from '../src/metrics/correctness';

// tells jest these modules are mocked 
jest.mock('isomorphic-git');
jest.mock('isomorphic-git/http/node');
jest.mock('../src/metrics/clone_repo');
jest.mock('../src/apiProcess/gitApiProcess');
jest.mock('../src/logger', () => ({
  log: {
    info: jest.fn(),
    debug: jest.fn(),
  },
}));
// alias for mocked modules/functions
const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedGit = require('isomorphic-git');
const mockedGetGithubInfo = require('../src/apiProcess/gitApiProcess').getGithubInfo as jest.MockedFunction<typeof getGithubInfo>;

const testRepoUrl = "https://github.com/facebook/react";
let clonedPath: string;
let metric: RepoDetails;


describe("calculateCorrectness: Mock ideal repo with test/ src/ CI/CD", () => {
    // in this block, we mock the existence of the cloned repository so that it always returns true
    // this way we can test how calculateCorrectness behaves when the repository exists
    beforeEach(async () => {
    // Mock the cloneRepo function
    clonedPath = "mocked/repo";
    // set up a mocked file system named '/mocked/repo'
        mock({
            '/mocked/repo': {
            'src': {
                'file1.ts': '',
                'file2.ts': '',
            },
            'test': {
                'test1.ts': '',
                'test2.ts': '',
            },
            'README.md': '',
            '.travis.yml': '',
            },
        });
    // Mock the getGithubInfo function
    metric = {
        contributorsData: [
        { name: "Alice", total: 50 },
        { name: "Bob", total: 30 },
        { name: "Charlie", total: 20 },
        ],
        owner: "facebook",
        repo: "react",
        createdAt: "2013-05-24T16:15:54Z",
        stars: 170000,
        forks: 34000,
        openIssues: 700,
        license: "MIT",
        commitsData: ["commitsData"],
        issuesData: ["1", "2", "3"],
    };
    // mock getGithubInfo to return the value specified in metric
    mockedGetGithubInfo.mockResolvedValue(metric);  
    mockedFs.existsSync.mockReturnValue(true);  //give existsSync a mocked return value of true
    // Ensure the mocks are working as expected
    expect(clonedPath).not.toBeNull();
    expect(metric).not.toBeNull();
});
  it("should calculate correctness for the mocked repository", async () => {
    const correctness = await calculateCorrectness(metric, clonedPath);
    expect(mockedFs.existsSync).toHaveBeenCalledTimes(1);
    expect(correctness).toBeLessThanOrEqual(1);
    expect(correctness).toBeGreaterThanOrEqual(0);
    // Add more assertions based on the expected correctness value
  });
  it("should throws an error if clonePath is invalid", async () => {
    await expect(calculateCorrectness(metric, "/invalid/path")).rejects.toThrow();
  });
});

describe('File System Navigation: with CI/CD, src/, and test/', () => {
  beforeEach(() => {
    // set up a mocked file system named '/mocked/repo'
    mock({
      '/mocked/repo': {
        'src': {
          'file1.ts': '',
          'file2.ts': '',
        },
        'test': {
          'test1.ts': '',
          'test2.ts': '',
        },
        'README.md': '',
        '.travis.yml': '',
      },
    });
  });

  afterEach(() => {
    mock.restore();
  });

  test('should find src folder', async () => {
    const srcPath = await __findSrc('/mocked/repo');
    expect(srcPath).toBe('/mocked/repo/src');
  });

  test('should find test folder', async () => {
    const testPath = await __findTest('/mocked/repo');
    expect(testPath).toBe('/mocked/repo/test');
  });

  test('should count files in directory', async () => {
    const fileCount = await __countFilesInDirectory('/mocked/repo/src');
    expect(fileCount).toBe(2);
  });
});

describe('File System Navigation: missing src/', () => {
  beforeEach(() => {
    // set up a mocked file system named '/mocked/repo'
    mock({
      '/mocked/repo': {
        'test': {
          'test1.ts': '',
          'test2.ts': '',
        },
        'README.md': '',
        '.travis.yml': '',
      },
    });
  });

  afterEach(() => {
    mock.restore();
  });

  test('should not find src folder', async () => {
    const srcPath = await __findSrc('/mocked/repo');
    expect(srcPath).toBeNull();
  });

  test('should find test folder', async () => {
    const testPath = await __findTest('/mocked/repo');
    expect(testPath).toBe('/mocked/repo/test');
  });

  test('__countFilesInDirectory(src) should be 0', async () => {
    const fileCount = await __countFilesInDirectory('/mocked/repo/src');
    expect(fileCount).toBe(0);
  });
});

describe("File system navigation: missing test/", () => {
    beforeEach(() => {
        // set up a mocked file system named '/mocked/repo'
        mock({
        '/mocked/repo': {
            'src': {
            'file1.ts': '',
            'file2.ts': '',
            },
            'README.md': '',
            '.travis.yml': '',
        },
        });
    });
    
    afterEach(() => {
        mock.restore();
    });
    
    test('should find src folder', async () => {
        const srcPath = await __findSrc('/mocked/repo');
        expect(srcPath).toBe('/mocked/repo/src');
    });
    
    test('should not find test folder', async () => {
        const testPath = await __findTest('/mocked/repo');
        expect(testPath).toBeNull();
    });
    
    test('__countFilesInDirectory(test) should be 0', async () => {
        const fileCount = await __countFilesInDirectory('/mocked/repo/test');
        expect(fileCount).toBe(0);
    });
});