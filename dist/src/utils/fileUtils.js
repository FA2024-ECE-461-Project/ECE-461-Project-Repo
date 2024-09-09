//Contains utility functions for reading and writing files. 
//For example, readFile reads a file and returns its contents as an array of strings.
import * as fs from 'fs';
import * as path from 'path';
// Function to read URLs from a file and print them as NDJSON to stdout
export function readUrlsFromFile(filePath) {
    return new Promise((resolve, reject) => {
        const absolutePath = path.resolve(filePath);
        fs.readFile(absolutePath, 'utf8', (err, data) => {
            if (err) {
                reject(`Error reading file: ${err.message}`);
            }
            else {
                const urls = data.trim().split('\n').filter(Boolean);
                resolve(urls);
            }
        });
    });
}
