"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Enum for URL types
/*enum UrlType {
  GitHub = 'GitHub',
  npm = 'npm',
  Invalid = 'Invalid URL'
}

// Function to determine if the link is a GitHub, npm, or invalid URL
function checkUrlType(url: string): UrlType {
  const githubPattern = /^(https?:\/\/)?(www\.)?github\.com\/[^\/]+\/[^\/]+/;
  const npmPattern = /^(https?:\/\/)?(www\.)?npmjs\.com\/package\/[^\/]+/;

  /*if (githubPattern.test(url)) {
    return UrlType.GitHub;
  } else if (npmPattern.test(url)) {
    return UrlType.npm;
  } else {
    return UrlType.Invalid;
  }
}*/
// Function to read URLs from a file and print them as NDJSON to stdout
function readUrlsFromFile(filePath) {
    const absolutePath = path.resolve(filePath);
    fs.readFile(absolutePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err.message}`);
            process.exit(1);
        }
        const urls = data.trim().split('\n');
        urls.forEach(url => {
            // Print the URL as NDJSON
            const jsonOutput = JSON.stringify({ url });
            console.log(jsonOutput);
            // Print the type of URL (for testing purposes only)
            //const type = checkUrlType(url);
            //console.log(type);
        });
    });
}
// Parse command-line arguments
const args = process.argv.slice(2); //examine the first command line arg feed into cli.ts (similar to argv[1] in C programming)
if (args.length !== 1) {
    console.error('Usage: ./run URL_FILE');
    process.exit(1); //end process with error code 1 (EXIT SUCCESS)
}
const urlFile = args[0];
readUrlsFromFile(urlFile);
