# ECE-461-Project-Repo
A Command Line Interface (CLI) tool designed to evaluate and score npm packages based on various quality and popularity metrics. This project automates the analysis of npm packages, providing insights for developers looking to assess the reliability of open-source software.

## ECE 461 Team Project Repository
This repository contains the code and resources for our ECE 461 team project.

## Team Members:
Jimmy: Lead Developer
Gaurav Vermani: API Integration Specialist
Ryan: Testing and Debugging Lead
Nick Ko: CLI Design and User Experience

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

Here, URL_FILE refers to a text file (such as url.txt) that contains a list of npm package URLs or names. The program will process each package, compute its score, and provide a detailed report on the quality and popularity of each package.
