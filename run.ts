// src/run.ts
import * as fs from 'fs';
import * as path from 'path';

// Function to read a URL from a file and print it
function readUrlFromFile(filePath: string): void {
  const absolutePath = path.resolve(filePath);
  fs.readFile(absolutePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file: ${err.message}`);
      process.exit(1);
    }
    const url = data.trim();
    console.log('URL:', url);
  });
}

// Parse command-line arguments
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: ./run URL_FILE');
  process.exit(1);
}

const urlFile = args[0];
readUrlFromFile(urlFile);