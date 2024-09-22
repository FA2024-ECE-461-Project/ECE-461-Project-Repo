/** @type {import('ts-jest').JestConfigWithTsJest} **/

// module.exports = {
//   testEnvironment: "node",
//   transform: {
//     "^.+.tsx?$": ["ts-jest",{}],
//   },
// };
//above syntax is for other versions of jest, for jest 27.0.6, the syntax is as below
export default {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  }, 
  testResultsProcessor: "./testResultProcessor.ts",
  collectCoverage: true,
  testMatch: ['<rootDir>/test/*.test.ts']  //modify this to specify what tests to run 
};