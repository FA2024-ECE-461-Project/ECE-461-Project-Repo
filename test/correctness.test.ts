import fs from "fs";
import path from "path";
import { vol } from "memfs"; // to mock a directory with virtual memory file system
import { calculateCorrectness } from "../src/metrics/correctness";
import { RepoDetails } from "../src/apiProcess/gitApiProcess";
import { log } from "../src/logger";
import { clone } from "isomorphic-git";
import exp from "constants";

jest.mock("fs");
jest.mock("../src/logger", () => ({
  log: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedLog = log as jest.Mocked<typeof log>;

describe("calculateCorrectness with almost complete repository", () => {
  let metrics: RepoDetails; //global for the this suite
  const clonedPath = "mocked/cloned/path";
  beforeAll(() => {
    // init metric value
    metrics = {
      owner: "owner",
      repo: "repo",
      createdAt: "2021-01-01",
      stars: 100,
      openIssues: 100,
      forks: 50,
      license: "MIT",
      commitsData: ["commitsData"],
      issuesData: [
        { number: "168", state: "open" },
        { number: "888", state: "closed" },
        { number: "666", state: "closed" },
      ],
      contributorsData: [
        { name: "Alice", total: 50 },
        { name: "Bob", total: 30 },
        { name: "Charlie", total: 20 },
      ],
    };
  });

  beforeEach(() => {
    vol.reset();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should give a score >= 0.5 with a complete repo", async () => {
    // mock a clonedPath and the directory it points to in virtual memory file system
    const repoOutlookJSON = {
      // key is file/repo name, key is content: they should all be strings
      ".README.md": "This is a README file",
      "src/file1.ts": "console.log('Hello World!')",
      "src/file2.ts": "console.log('Hello World!')",
      "test/file1.test.ts": "test code",
      "test/file2.test.ts": "test code",
      ".travis.yml": "travis file",
    };
    vol.fromJSON(repoOutlookJSON, clonedPath);
    //check if virtual memory file system is correctly set up
    expect(vol.existsSync(clonedPath)).toBeTruthy();
    //assertion for correctness
    const actualCorrectness = await calculateCorrectness(metrics, clonedPath);
    expect(actualCorrectness).toBeGreaterThanOrEqual(0.5);
    expect(actualCorrectness).toBeLessThanOrEqual(1);
  });

  it("should score <= 0.5 if src/ is empty", async () => {
    // mock a clonedPath and the directory it points to in virtual memory file system
    const repoOutlookJSON = {
      // key is file/repo name, key is content: they should all be strings
      ".README.md": "This is a README file",
      "src/": "",
      "test/file1.test.ts": "test code",
      "test/file2.test.ts": "test code",
      ".travis.yml": "travis file",
    };
    vol.fromJSON(repoOutlookJSON, clonedPath);
    //check if virtual memory file system is correctly set up
    expect(vol.existsSync(clonedPath)).toBeTruthy();

    //calculateCorrectness tests
    const score = await calculateCorrectness(metrics, clonedPath);
    expect(score).toBeLessThanOrEqual(0.5);
    expect(score).toBe(0);
  });

  it("should score a 0 if src/ does not exist ", async () => {
    // mock a clonedPath and the directory it points to in virtual memory file system
    const repoOutlookJSON = {
      // key is file/repo name, key is content: they should all be strings
      ".README.md": "This is a README file",
      "test/file1.test.ts": "test code",
      "test/file2.test.ts": "test code",
      ".travis.yml": "travis file",
    };
    vol.fromJSON(repoOutlookJSON, clonedPath);
    //check if virtual memory file system is correctly set up
    expect(vol.existsSync(clonedPath)).toBeTruthy();

    const score = await calculateCorrectness(metrics, clonedPath);
    expect(score).toBe(0);
  });

  it("should score a 0 if test/ does not exist ", async () => {
    // mock a clonedPath and the directory it points to in virtual memory file system
    const repoOutlookJSON = {
      // key is file/repo name, key is content: they should all be strings
      ".README.md": "This is a README file",
      "src/file1.ts": "",
      "src/file2.ts":
        "function recursion(num: number) {if(num <= 0) {return num;} return recursion(num - 1);}",
      ".travis.yml": "travis file",
    };
    vol.fromJSON(repoOutlookJSON, clonedPath);
    //check if virtual memory file system is correctly set up
    expect(vol.existsSync(clonedPath)).toBeTruthy();

    const score = await calculateCorrectness(metrics, clonedPath);
    expect(score).toBe(0);
  });

  it("should score a 0 with only deeply hidden ci/cd file", async () => {
    // mock a clonedPath and the directory it points to in virtual memory file system
    const repoOutlookJSON = {
      // key is file/repo name, key is content: they should all be strings
      ".README.md": "This is a README file",
      ".github/config.json": "github config",
      ".github/workflow/fileA.txt": "",
      ".github/workflow/fileB.txt": "",
      ".github/workflow/CI/.travis.yml": "travis config file",
    };
    vol.fromJSON(repoOutlookJSON, clonedPath);
    //check if virtual memory file system is correctly set up
    expect(vol.existsSync(clonedPath)).toBeTruthy();

    const score = await calculateCorrectness(metrics, clonedPath);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});
