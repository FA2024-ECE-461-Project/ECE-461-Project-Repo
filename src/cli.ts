//Handles the command-line interface logic.
//Reads the file path from the command-line arguments,
//reads the URLs from the file, and calls the processUrls function from index.ts

import { checkUrlType, processUrl } from "./utils/urlUtils";
import { readUrlsFromFile } from "./utils/fileUtils";
import { GetNetScore } from "./metrics/netScore";
import { log } from "./logger";
// Main function to handle the asynchronous logic
export async function cli() {
  // Create a logger instance
  // const log: Logger<object> = new Logger({ name: "myLogger" });
  // log.silly("I am a silly log.");

  //read from the command line arguments
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    log.error("Usage: ./run FILE_PATH");
    process.exit(1);
  }

  // Extract file path from command-line arguments
  const filePath = args[0];
  try {
    // Extract URLs from file
    const urls = await readUrlsFromFile(filePath); // Assuming the file name is 'url.txt'
    const results = [];

    // Process each URL
    for (let url of urls) {
      // console.log(`Processing URL: ${url}`);
      const urlType = checkUrlType(url);
      const rawUrl = url;
      url = rawUrl.trim();
      try {
        // Process URL to get owner and repo
        const { owner, repo } = await processUrl(urlType, url);
        const metrics = await GetNetScore(owner, repo, url);
        console.log(JSON.stringify(metrics, null, 2)); //change third argument to 0 to remove indentation for evaluation
      } catch (error) {
        log.error(`Error processing URL ${url}:`, error);
      }
    }
  } catch (error) {
    log.error(error);
  }
}
