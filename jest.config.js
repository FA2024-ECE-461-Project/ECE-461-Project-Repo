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
  testMatch: ['<rootDir>/test/*.ts']  //only run test scripts in the test folder
};