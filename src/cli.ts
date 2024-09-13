//Handles the command-line interface logic. 
//Reads the file path from the command-line arguments, 
//reads the URLs from the file, and calls the processUrls function from index.ts

import { checkUrlType, processUrl, extractPackageNameFromUrl } from './utils/urlUtils';
import { readUrlsFromFile } from './utils/fileUtils';
import { GetNetScore } from './metrics/netScore';
import {getNpmPackageInfo} from './apiProcess/npmApiProcess';
import {getGithubInfo} from './apiProcess/gitApiProcess';

// Parse command-line arguments
const args = process.argv.slice(2); // Examine the first command line arg feed into cli.ts (similar to argv[1] in C programming)
if (args.length !== 1) {
  console.error('Usage: ./run URL_FILE');
  process.exit(1);  // End process with error code 1 (EXIT SUCCESS)
}

// Main function to handle the asynchronous logic
export async function cli() {
  try {
    // // Extract URLs from file
    // const urls = await readUrlsFromFile('url.txt'); // Assuming the file name is 'url.txt'
    // // Process each URL
    // for (const url of urls) {
    //   const urlType = checkUrlType(url);
    //   try{
    //     const {owner, repo} = await processUrl(urlType, url);

    //     //print repo url and owner and repo
    //     console.log(`\nOwner: ${owner}, Repo: ${repo}`)
    //     console.log(`URL: ${url}`);
    //     const packageName = extractPackageNameFromUrl(url);
    //     await GetNetScore(owner, repo, packageName); 
    //   } catch(error) {
    //     console.error(`Error processing URL ${url}:`, error);
    //   }
    // }
    getGithubInfo("lodash", "lodash");
  } catch (error) {
    console.error(error);
  }
}


