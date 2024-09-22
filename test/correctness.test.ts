import fs from 'fs';
import path from 'path';
import { vol } from 'memfs';  // to mock a directory with virtual memory file system
import { calculateCorrectness } from '../src/metrics/correctness';
import { RepoDetails } from '../src/apiProcess/gitApiProcess';
import { log } from '../src/logger';

jest.mock('fs');
jest.mock('../src/logger', () => ({
  log: {
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedLog = log as jest.Mocked<typeof log>;

describe('calculateCorrectness with a repo that has all data', () => {
  let metrics: RepoDetails;  //global for the this suite
  const clonedPath = "mocked/cloned/path";
  beforeAll(() => {
    // init metric value
    metrics= {
        owner: "owner",
        repo: "repo",
        createdAt: "2021-01-01",
        stars: 100,
        openIssues: 100,
        forks: 50,
        license: "MIT",
        commitsData: ["commitsData"],
        issuesData: [
          {"number": "168", "state": "open"}, 
          {"number": "888", "state": "closed"}, 
          {"number": "666", "state": "closed"}
        ],
        contributorsData: [
          { name: "Alice", total: 50 },
          { name: "Bob", total: 30 },
          { name: "Charlie", total: 20 },
        ]
      };
      // mock a clonedPath and the directory it points to in virtual memory file system
      const repoOutlookJSON = { 
      // key is file/repo name, key is content: they should all be strings
        '.README.md': 'This is a README file',
        'src/file1.ts': "console.log('Hello World!')",
        'src/file2.ts': "console.log('Hello World!')",
        'test/file1.test.ts': 'test code',
        'test/file2.test.ts': 'test code',
        '.travis.yml': 'travis file'
      };
      vol.fromJSON(repoOutlookJSON, clonedPath);

      //check if virtual memory file system is correctly set up
      expect(vol.existsSync(clonedPath)).toBeTruthy();
    });
    afterAll(() => {
      jest.restoreAllMocks();
    });
  it('should give a score >= 0.5', async () => {
      const actualCorrectness = await calculateCorrectness(metrics,clonedPath);
      expect(actualCorrectness).toBeGreaterThanOrEqual(0.5);
      expect(actualCorrectness).toBeLessThanOrEqual(1);
    });


});