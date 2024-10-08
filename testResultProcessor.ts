import { AggregatedResult, TestResult } from '@jest/test-result';

// this function tells Jest to ouput test result in the way specified in specs
export default function testResultProcessor(testResults: AggregatedResult): AggregatedResult {
  const totalTests = testResults.numTotalTests;
  const passedTests = testResults.numPassedTests;

  const coverage = testResults.coverageMap 
    ? testResults.coverageMap.getCoverageSummary().data
    : null;

  // Calculating line coverage percentage
  const lineCoverage = coverage 
    ? (coverage.lines.covered / coverage.lines.total) * 100 
    : 0;

  const totalCases = totalTests;
  const passedCases = passedTests;
  const percentageLineCoverage = lineCoverage.toFixed(2); // formatted to 2 decimal places

  console.log(`${passedCases}/${totalCases} test cases passed. ${percentageLineCoverage}% line coverage achieved`);

  return testResults; // Jest still needs the results object, so we return it
}
