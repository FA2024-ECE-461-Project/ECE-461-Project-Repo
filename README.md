# ECE-461-Project-Repo
This is a command-line interface (CLI) that reads the provided URL file to trigger API calls and fetch data from GitHub. Various metrics, such as bus factor, correctness, license compatibility, ramp-up time, responsiveness, and a final net score, are calculated based on the gathered information wherein each metric and netscore are a value from 0 to 1, inclusive of both. For correctness and ramp-up time, the system uses the isomorphic-git library to clone the repository and analyze its contents. The net score metric aggregates the results of all other metrics and includes the latency of each, including cloning latency. To optimize performance, the calculation of metrics is done in parallel by parts to save time, however, API calls are rate-limited using the bottleneck package to have a gap of 0.75s between each request. A logging mechanism is implemented with different log levels (info, debug and error) to track system operations. Lastly, a Jest-based test suite is developed, which includes mock tests to ensure the functionality of each component in the system.

## ECE 461 Team Project Repository
This repository contains the code and resources for our ECE 461 team project.

## Team Members:
- Jimmy Ho
- Gaurav Vermani
- Ryan Lin
- Nick Ko

### Environment Setup
To set up the environment and install all necessary dependencies for the project, run the following command:
```
./run install
```
This command will automatically fetch and install all required npm packages, ensuring the environment is ready for use.

### Running Tests
We use Jest for unit testing to ensure the reliability and correctness of our code. Jest is a widely used testing framework that provides a clean way to test our functions and catch errors before deployment.

To execute the test suite, run:

```
./run test
```
This command will trigger Jest to run all defined test cases, providing a detailed report of pass/fail statuses and helping you catch issues early in development.

### Running the Program
To start the main program and analyze npm packages based on URLs provided in a file, use the following command:

```
./run URL_FILE
```

Here, URL_FILE refers to a text file (such as url.txt) that contains a list of npm package URLs or names. The program will process each package, compute its score, and provide a detailed report on the quality of each package.

### Errors and Error Handling

The actions in the following list will lead to the invocation of console.error('...') and process termination with a return code of 1:
- Invalid or missing LOG_FILE path
- Invalid URL file path
- Invalid or missing GitHub Token
- Invalid URL
- Exceeding GitHub rate limit
- Any other HTTP response status codes from 400 to 600, inclusive, when fetching GitHub data
