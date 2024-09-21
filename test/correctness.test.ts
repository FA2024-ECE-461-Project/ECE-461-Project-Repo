import { cloneRepo, removeRepo } from "../src/metrics/clone_repo";
import { calculateCorrectness } from "../src/metrics/correctness";
import { getGithubInfo, RepoDetails } from "../src/apiProcess/gitApiProcess";


const testRepoUrl = "https://github.com/facebook/react";
let clonedPath: string; //declare here so all tests have access
let metric: RepoDetails;

// setup mocks: should do this else test time out is an automatic fail
jest.mock('isomorphic-git');
jest.mock('isomorphic-git/http/node');
const mockedGit = require('isomorphic-git');

beforeAll(async () => {
  // setting up: mock isomorphic-git: do this later
  clonedPath = await cloneRepo(testRepoUrl);
  metric = await getGithubInfo("facebook", "react");
  expect(clonedPath).not.toBeNull();
  mockedGit.clone.mockResolvedValueOnce(clonedPath);
});

describe("correctness score tests on react", () => {
  test("correctness with valid cloned repo", async () => {
    const correctnessScore = await calculateCorrectness(metric, clonedPath);
    expect(correctnessScore).toBeGreaterThan(0);
  });
});


afterAll(async () => {
  // teardown: remove cloned repo: can remove this if mock isomorphic-git is implemented
  const removed = await removeRepo(testRepoUrl);
  expect(removed).toBeTruthy();
});
