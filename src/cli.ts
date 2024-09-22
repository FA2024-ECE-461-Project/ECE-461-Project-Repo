import { checkUrlType, processUrl } from "./utils/urlUtils";
import { readUrlsFromFile } from "./utils/fileUtils";
import { GetNetScore } from "./metrics/netScore";
import { log } from "./logger";

/*
  Function Name: cli
  Description: This function serves as the main command-line interface logic. It reads the file path from the command-line arguments,
               reads URLs from the file, determines the URL type, processes each URL to extract owner and repo information, and then 
               calculates the metrics using GetNetScore.
  @params: None
  @returns: None
*/

export async function cli() {
  // Read from the command line arguments
  const args = process.argv.slice(2);

  // Check if exactly one argument (file path) is provided
  if (args.length !== 1) {
    log.error("Usage: ./run FILE_PATH");
    process.exit(1); // Exit with error code if arguments are incorrect
  }

  // Extract the file path from command-line arguments
  const filePath = args[0];
  try {
    // Read URLs from the provided file
    log.info(`Reading URLs from file: ${filePath}`);
    const urls = await readUrlsFromFile(filePath); // Assuming the file contains URLs line by line

    // Store the results of the processing
    const results = [];

    // Process each URL from the file
    for (let url of urls) {
      log.info(`Processing URL: ${url}`);

      // Determine the type of the URL (GitHub, npm, or invalid)
      const urlType = checkUrlType(url);
      const rawUrl = url.trim();

      try {
        // Process the URL and extract the owner and repo information
        const { owner, repo } = await processUrl(urlType, rawUrl);

        // Calculate the metrics for the given owner and repo
        const metrics = await GetNetScore(owner, repo, url);
        // Print the results in JSON format
        console.log(JSON.stringify(metrics, null, 2)); // For pretty printing in output
      } catch (error) {
        // Log and print error if processing the URL fails
        log.error(`Error processing URL ${url}:`, error);
        process.exit(1); // Exit with error code if a URL processing fails
      }
    }
  } catch (error) {
    // Log error if the file cannot be read
    log.error(`Unable to read URLs from file ${filePath}`, error);
    process.exit(1); // Exit with error code if file read fails
  }
}
