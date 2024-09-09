import { getRepoStars } from "../src/apiProcess/gitApiProcess";
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from a .env file into process.env
console.log("This is a test script.");

//(global) variables available to all tests in this script
const GITHUB_API_URL = 'https://api.github.com/repos';
const owner = "cloudinary";
const repo: string = "cloudinary_npm";
const expectedURL = `${GITHUB_API_URL}/${owner}/${repo}`;

// Mock the axios behavior (should do this instead of doing real api calls)
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getRepoStars', () => {
  const mockOwner = 'octocat';
  const mockRepo = 'Hello-World';
  const mockUrl = `https://api.github.com/repos/${mockOwner}/${mockRepo}`;

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

afterEach(() => {
  jest.clearAllMocks();
});

//need to configure mock to ensure no Jest failure