import * as fs from 'fs';
import * as path from 'path';

// Function to read URLs from a file and print them as NDJSON to stdout
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
      const jsonOutput = JSON.stringify({ url });
      console.log(jsonOutput);
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