//Handles the command-line interface logic. 
//Reads the file path from the command-line arguments, 
//reads the URLs from the file, and calls the processUrls function from index.ts

import { checkUrlType, processUrl, UrlType } from './utils/urlUtils';
import { readUrlsFromFile } from './utils/fileUtils';
import { correctnessMetric } from './metrics/correctness';
import { getGitHubRepoFromNpmUrl } from './apiProcess/npmApiProcess';
import { convertSshToHttps } from './utils/urlUtils';
import { extractOwnerAndRepo } from './utils/urlUtils';

// Parse command-line arguments
const args = process.argv.slice(2); // Examine the first command line arg feed into cli.ts (similar to argv[1] in C programming)
if (args.length !== 1) {
  console.error('Usage: ./run URL_FILE');
  process.exit(1);  // End process with error code 1 (EXIT SUCCESS)
}

// Main function to handle the asynchronous logic
// export async function cli() {
//   try {
//     // Extract URLs from file
//     const urls = await readUrlsFromFile(args[0]);
//     // console.log(`Input URL: ${urls}`);

//     // Check URL type
//     urls.forEach(async url => {
//       const urlType = checkUrlType(url);
//       if(urlType == 'npm'){
//         const x = await getGitHubRepoFromNpmUrl('browserify');
//         console.log(x);
//       }

//     });

//   } catch (error) {
//     console.error(error);
//   }
// }

// Function to validate and ensure proper URL format (adds missing slashes)
function ensureValidUrlFormat(url: string): string {
  // Ensure the URL starts with the proper 'https://' prefix
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  return url;
}

export async function cli() {
  try {
    // Extract URLs from file
    const urls = await readUrlsFromFile(args[0]);

    // Process each URL
    for (const url of urls) {
      // Ensure URL format is correct
      const formattedUrl = ensureValidUrlFormat(url);
      const urlType = checkUrlType(formattedUrl);

      if (urlType === UrlType.GitHub) {
        // Convert SSH to HTTPS if needed
        const httpUrl = convertSshToHttps(formattedUrl) || formattedUrl;
        
        // Extract owner and repo from the GitHub URL
        const { owner, repo } = extractOwnerAndRepo(httpUrl);
        console.log(`Owner: ${owner}, Repo: ${repo}`);

      } else if (urlType === UrlType.npm) {
        try {
          // Handle NPM URL by fetching the GitHub repository linked to the npm package
          console.log(`Fetching GitHub repo for npm package: ${formattedUrl}`);

          const gitHubRepoUrl = await getGitHubRepoFromNpmUrl(formattedUrl);
          console.log(`GitHub Repo from NPM: ${gitHubRepoUrl}`);
        } catch (err) {
          console.error(`Error fetching GitHub repo from npm package: ${err.message}`);
        }
      } else {
        console.error(`Invalid URL: ${formattedUrl}`);
      }
    }
  } catch (error) {
    console.error('Error processing URLs:', error);
  }
}