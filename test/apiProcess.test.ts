import { getGithubInfo, RepoDetails } from "../src/apiProcess/gitApiProcess";
import axios from "axios";
// Load environment variables from a .env file into process.env
import * as dotenv from "dotenv";
import { before } from "node:test";
dotenv.config();

// Mock the axios behavior (should do this instead of doing real api calls)
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

//global variables accessible to all suites in this file
const mockOwner: string = "octocat";
const mockRepo: string = "Hello-World";
const mockUrl: string = `https://api.github.com/repos/${mockOwner}/${mockRepo}`;

//if neccessary, use beforeEach/beforeAll clauses to intialize variables declared using let/var

// describe specifies the name of the test suite that contains all kinds of tests
describe("test getGithubInfo", () => {
  // test specifies the individual test (on different properties)
  test("should return a RepoDetails instance on success", async () => {
    //  mock the Axios response (format what fields in the entire json should be returned)
    const mockResponse = {
      data: {
        owner: { login: "some-owner" },
        repo: "some-repo",
        stargazers_count: 100,
        open_issues_count: 5,
        forks_count: 10,
        pull_requests: 2, // Might need to mock a separate request depending on your API
        license: { name: "MIT" },
        description: "Some description",
      },
    };
    const mockCommitResponse = {
      data: [
        {
          commit: {
          }
        }
    };
    // mock the axios.get call
    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const returnedGithubInfo: RepoDetails = await getGithubInfo(
      mockOwner,
      mockRepo,
    );

    // Check that axios.get was called with the correct URL and headers
    expect(mockedAxios.get).toHaveBeenCalledWith(mockUrl, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });

    // Check the returned RepoDetails
    //use toEqual when checking if 2 classes' have same values in each field
    expect(returnedGithubInfo).toEqual({
      owner: mockOwner,
      repo: mockRepo,
      stars: 100,
      issues: 5,
      forks: 10,
      pullRequests: 0,
      license: "MIT",
      discrption: "Some description",
    });
  });
});

// clean up resources used by mocking axios
afterEach(() => {
  jest.clearAllMocks();
});

//need to configure mock to ensure no Jest failure
