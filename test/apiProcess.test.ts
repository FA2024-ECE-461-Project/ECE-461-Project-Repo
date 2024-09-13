import { getGithubInfo } from "../src/apiProcess/gitApiProcess";
import axios from 'axios';
// Load environment variables from a .env file into process.env
import * as dotenv from 'dotenv';
dotenv.config(); 

// Mock the axios behavior (should do this instead of doing real api calls)
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

//global variables accessible to all suites in this file
//if neccessary, use beforeEach/beforeAll clause
const mockOwner = 'octocat';
const mockRepo = 'Hello-World';
const mockUrl = `https://api.github.com/repos/${mockOwner}/${mockRepo}`;

// describe specifies the name of the test suite that contains all kinds of tests
describe('test getRepoStars', () => {
  // test specifies the individual test (on different properties) 
  test('should return the number of stars on success', async () => {
    // Mock the resolved response from axios.get
    mockedAxios.get.mockResolvedValue({
      data: {
        stargazers_count: 100,
      },
    });

    const stars = await getRepoStars(mockOwner, mockRepo);
    
    // Check that axios.get was called with the correct URL and headers
    expect(mockedAxios.get).toHaveBeenCalledWith(mockUrl, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });

    // Check the returned number of stars
    expect(stars).toBe(100);
  });
})

describe('test getRepoIssues', () => {

  it('should return the number of stars on success', async () => {
    // Mock the resolved response from axios.get
    mockedAxios.get.mockResolvedValue({
      data: {
        stargazers_count: 100,
      },
    });

    const stars = await getRepoStars(mockOwner, mockRepo);
    
    // Check that axios.get was called with the correct URL and headers
    expect(mockedAxios.get).toHaveBeenCalledWith(mockUrl, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    });

    // Check the returned number of stars
    expect(stars).toBe(100);
  });
})

// clean up resources used by mocking axios
afterEach(() => {
  jest.clearAllMocks();
});

//need to configure mock to ensure no Jest failure
