//Handles the command-line interface logic. 
//Reads the file path from the command-line arguments, 
//reads the URLs from the file, and calls the processUrls function from index.ts

import { checkUrlType, UrlType } from './utils/urlUtils';
import { readUrlsFromFile } from './utils/fileUtils';
import { printRepoInfo } from './metrics/correctness';

// Parse command-line arguments
const args = process.argv.slice(2); // Examine the first command line arg feed into cli.ts (similar to argv[1] in C programming)
if (args.length !== 1) {
  console.error('Usage: ./run URL_FILE');
  process.exit(1);  // End process with error code 1 (EXIT SUCCESS)
}

// Main function to handle the asynchronous logic
export async function cli() {
  try {
    // Extract URLs from file
    const urls = await readUrlsFromFile(args[0]);
    //console.log(urls);

    // Check URL type
    urls.forEach(url => {
      const urlType = checkUrlType(url);

      // Check if the URL is valid, only then calculate metrics etc.
      if (urlType != UrlType.Invalid) {
        //get number of star in a repo
        const [owner, repo] = url.split('/').slice(-2);
        printRepoInfo(owner, repo);
      }
    });

  } catch (error) {
    console.error(error);
  }
}
