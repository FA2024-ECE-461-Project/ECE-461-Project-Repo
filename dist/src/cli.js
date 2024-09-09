//Handles the command-line interface logic. 
//Reads the file path from the command-line arguments, 
//reads the URLs from the file, and calls the processUrls function from index.ts
import { checkUrlType, UrlType } from './utils/urlUtils';
import { readUrlsFromFile } from './utils/fileUtils';
// Parse command-line arguments
const args = process.argv.slice(2); //examine the first command line arg feed into cli.ts (similar to argv[1] in C programming)
if (args.length !== 1) {
    console.error('Usage: ./run URL_FILE');
    process.exit(1); //end process with error code 1 (EXIT SUCCESS)
}
//extract urls from file
try {
    const urls = await readUrlsFromFile(args[0]);
    console.log(urls);
    //check url type
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
}
catch (error) {
    console.error(error);
}
