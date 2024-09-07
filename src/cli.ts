import * as fs from 'fs';
import * as path from 'path';

// Enum for URL types
enum UrlType {
  GitHub = 'GitHub',
  npm = 'npm',
  Invalid = 'Invalid URL'
}

// Function to determine if the link is a GitHub, npm, or invalid URL
function checkUrlType(url: string): UrlType {
  const githubPattern = /^(https?:\/\/)?(www\.)?github\.com\/[^\/]+\/[^\/]+/;
  const npmPattern = /^(https?:\/\/)?(www\.)?npmjs\.com\/package\/[^\/]+/;

  if (githubPattern.test(url)) {
    return UrlType.GitHub;
  } else if (npmPattern.test(url)) {
    return UrlType.npm;
  } else {
    return UrlType.Invalid;
  }
}

// Function to read URLs from a file and print them as NDJSON to stdout
function readUrlsFromFile(filePath: string): void {
  const absolutePath = path.resolve(filePath);
  fs.readFile(absolutePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file: ${err.message}`);
      process.exit(1);
    }
    const urls = data.trim().split('\n');
    urls.forEach(url => {

      const urlType = checkUrlType(url);

      // Check if the URL is valid, only then calculate metrics etc.
      if (urlType != UrlType.Invalid) { 
        // Print the URL as NDJSON
        const jsonOutput = JSON.stringify({ url });
        console.log(jsonOutput);

        // Print the type of URL (for testing purposes only)
        // Remove/Comment this when submitting the final version
        console.log(urlType);
      }
    });
  });
}

// Parse command-line arguments
const args = process.argv.slice(2); //examine the first command line arg feed into cli.ts (similar to argv[1] in C programming)
if (args.length !== 1) {
  console.error('Usage: ./run URL_FILE');
  process.exit(1);  //end process with error code 1 (EXIT SUCCESS)
}

const urlFile = args[0];
readUrlsFromFile(urlFile);