import { readFileSync } from "fs";

// Paths to the JSON report files
const testResultsPath = "./test-results.json";
const coverageSummaryPath = "./coverage/coverage-summary.json";

try {
  // Read and parse the test results
  const testResultsData = readFileSync(testResultsPath, "utf8");
  const testResults = JSON.parse(testResultsData);
  const passedTests = testResults.numPassedTests;
  const totalTests = testResults.numTotalTests;

  // Read and parse the coverage summary
  const coverageData = readFileSync(coverageSummaryPath, "utf8");
  const coverageSummary = JSON.parse(coverageData);

  // Extract line coverage information
  const totalLines = coverageSummary.total.lines.total;
  const coveredLines = coverageSummary.total.lines.covered;
  const lineCoverage = (coveredLines / totalLines) * 100;

  // Check if requirements are met
  const minTests = 20;
  const minCoverage = 80;
  const allTestsPassed = passedTests === totalTests;
  const sufficientTests = totalTests >= minTests;
  const sufficientCoverage = lineCoverage >= minCoverage;

  // Print the results
  console.log(
    `${passedTests}/${totalTests} test cases passed. ${lineCoverage.toFixed(0)}% line coverage achieved.`,
  );

  // Exit with appropriate code
  if (allTestsPassed && sufficientTests && sufficientCoverage) {
    process.exit(0);
  } else {
    process.exit(1);
  }
} catch (err) {
  console.error(
    "Error reading or parsing test results or coverage summary:",
    err,
  );
  process.exit(1);
}
