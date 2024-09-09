//Handles the command-line interface logic. 
//Reads the file path from the command-line arguments, 
//reads the URLs from the file, and calls the processUrls function from index.ts

import { checkUrlType, processUrl, UrlType } from './utils/urlUtils';
import { readUrlsFromFile } from './utils/fileUtils';
import { correctnessMetric } from './metrics/correctness';
import { getGitHubRepoFromNpmUrl } from './apiProcess/npmApiProcess';
import { convertSshToHttps } from './utils/urlUtils';

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
    // console.log(`Input URL: ${urls}`);

    // Check URL type
    urls.forEach(async url => {
      const urlType = checkUrlType(url);
      if(urlType == 'npm'){
        const x = await getGitHubRepoFromNpmUrl('browserify');
        console.log(x);
      }

    });

  } catch (error) {
    console.error(error);
  }
}
