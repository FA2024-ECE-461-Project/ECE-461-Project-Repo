//Contains utility functions for parsing and validating URLs.
// Enum for URL types
export var UrlType;
(function (UrlType) {
    UrlType["GitHub"] = "GitHub";
    UrlType["npm"] = "npm";
    UrlType["Invalid"] = "Invalid URL";
})(UrlType || (UrlType = {}));
// Function to determine if the link is a GitHub, npm, or invalid URL
export function checkUrlType(url) {
    const githubPattern = /^(https?:\/\/)?(www\.)?github\.com\/[^\/]+\/[^\/]+/;
    const npmPattern = /^(https?:\/\/)?(www\.)?npmjs\.com\/package\/[^\/]+/;
    if (githubPattern.test(url)) {
        return UrlType.GitHub;
    }
    else if (npmPattern.test(url)) {
        return UrlType.npm;
    }
    else {
        return UrlType.Invalid;
    }
}
