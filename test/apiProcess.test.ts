import { getRepoStars } from "../src/apiProcess/gitApiProcess";
import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from a .env file into process.env
// test/test.ts
console.log("This is a test script.");

//(global) variables available to all tests in this script
const GITHUB_API_URL = 'https://api.github.com/repos';
const owner = "cloudinary";
const repo: string = "cloudinary_npm";
const expectedURL = `${GITHUB_API_URL}/${owner}/${repo}`;

// Mock the fetch API (should do this, but lets wait for the following to work first)
// global.fetch = jest.fn(() =>
//   Promise.resolve({
//     json: () => Promise.resolve({ number: 42 }),
//   })
// );

describe('getNumberFromApi', () => {
  it('should return a number from the API', async () => {
    const result = await getRepoStars(owner, repo);
    
    // Check if the returned value is correct
    expect(result).toBe(42);  // Expected number
  });

  it('should call the correct API endpoint', async () => {
    await getRepoStars(owner, repo);
    
    // Check if fetch was called with the correct API URL
    expect(fetch).toHaveBeenCalledWith(expectedURL);
  });
});