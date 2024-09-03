"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
// cli.ts
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Function to read a URL from a file and print it
function readUrlFromFile(filePath) {
    const absolutePath = path.resolve(filePath);
    fs.readFile(absolutePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err.message}`);
            process.exit(1);
        }
        const url = data.trim();
        console.log(url);
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
