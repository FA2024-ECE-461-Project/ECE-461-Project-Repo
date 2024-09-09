//Handles the command-line interface logic. 
//Reads the file path from the command-line arguments, 
//reads the URLs from the file, and calls the processUrls function from index.ts

import { checkUrlType, UrlType } from './utils/urlUtils';
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
    //console.log(urls);

    // Check URL type
    urls.forEach(url => {
      const urlType = checkUrlType(url);

      // Check if the URL is valid, only then calculate metrics etc.
      if (urlType != UrlType.Invalid) {
        //get number of star in a repo
        if(urlType == 'GitHub'){
          const [owner, repo] = url.split('/').slice(-2);
          //correctnessMetric(owner, repo);
        } else if (urlType == 'npm'){
          const packageName = url.split('/').slice(-1)[0];
          // const githubUrlFromNpm = await getGitHubRepoFromNpmUrl(packageName);
          // const githubHttp =  convertSshToHttps(githubUrlFromNpm);
        }

      }
    });

  } catch (error) {
    console.error(error);
  }
}
