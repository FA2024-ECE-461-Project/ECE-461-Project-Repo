import { _getCoverageScore } from "../src/metrics/correctness_helpers";
import { cloneRepo, removeRepo } from "../src/metrics/clone_repo";
import exp from "constants";

const testRepoUrl = "https://github.com/cloudinary/cloudinary_npm";
let clonedPath: string; //declare here so all tests have access
// setup mock isomorphic-git (optional, maybe cloning a small repo and do our tests on it is fine)
// jest.mock('isomorphic-git');
// const mockedGit = require('isomorphic-git');
beforeAll(async () => {
  // setting up: mock isomorphic-git: do this later
  clonedPath = await cloneRepo(testRepoUrl);
  expect(clonedPath).not.toBeNull();
  // mockedGit.clone.mockResolvedValueOnce(clonedPath);
});

describe("Correctness Helpers", () => {
  test("_getCoverageScore with valid cloned repo", async () => {
    const coverageScore = await _getCoverageScore(clonedPath);
    expect(coverageScore).toBeGreaterThan(0);
    expect(coverageScore).toBeLessThanOrEqual(1);
  });
  test("getCoverageScore with invalid cloned repo", async () => {
    const invalidPath = "invalid/path";
    const coverageScore = await _getCoverageScore(invalidPath);
    expect(coverageScore).toBe(0);
  });
});

afterAll(async () => {
  // teardown: remove cloned repo
  // can remove this if mock isomorphic-git is implemented
  const removed = await removeRepo(testRepoUrl);
  expect(removed).toBeTruthy();
});
