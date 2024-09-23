import * as fs from "fs";
import * as path from "path";

/*
  Function Name: readUrlsFromFile
  Description: This function reads URLs from a file, where each line contains a URL, and returns them as an array of strings.
  @params: 
    - filePath: string - The path to the file containing the URLs.
  @returns: Promise<string[]> - A promise that resolves to an array of URLs read from the file.
*/

export async function readUrlsFromFile(filePath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    // Get the absolute path to the file
    const absolutePath = path.resolve(filePath);

    // Read the file asynchronously
    fs.readFile(absolutePath, "utf8", (err, data) => {
      if (err) {
        // Reject the promise if an error occurs while reading the file
        reject(`Error reading file: ${err.message}`);
      } else {
        // Split the file content by line and filter out any empty lines
        const urls = data.trim().split("\n").filter(Boolean);
        resolve(urls); // Resolve the promise with the array of URLs
      }
    });
  });
}
