"use strict";
require('dotenv').config(); // Load .env file
const axios = require('axios');
// Function to fetch repository data
async function fetchGitHubRepo(owner, repo) {
    const token = process.env.GITHUB_TOKEN; // Load token from environment variable
    // Make an authenticated request to the GitHub API
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
            'Authorization': `token ${token}` // Use GitHub token for authentication
        }
    });
    console.log(response.data); // Output repository data
}
// Example usage
fetchGitHubRepo('facebook', 'react'); // Replace 'facebook' and 'react' with the repository you want to check
