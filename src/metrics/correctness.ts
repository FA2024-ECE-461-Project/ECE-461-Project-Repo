//calculate correctness
import {RepoDetails} from '../apiProcess/gitApiProcess';
import * as helpers from './correctness_helpers';

/* @param metric: RepoDetails - the returned output from getGitRepoDetails
*  @returns score between 0 and 1 evaluated from 
*  - test coverage score
*  - static analysis score
*  - issue ratio
*/
async function calculateCorrectness(metric: RepoDetails, clonedPath: string): Promise<number> {
  // dynamic analysis: compute test coverage score
  const testCoverageScore = await helpers._getCoverageScore(clonedPath);
  // get the issue information: reuse code from responsiveness
  let issueRatio;
  if (metric.issuesData.length != 0) {
    // Determine the start date for the 6-month period (or less if not enough data)
    const repoCreationDate = new Date(metric.created_at);
    const dateEarliestCommit = new Date(metric.commitsData[metric.commitsData.length - 1].commit.author.date);
    const dateEarliestIssue = new Date(metric.issuesData[metric.issuesData.length - 1].created_at);
    const sixMonthsAgo = new Date();
    //console.log(sixMonthsAgo);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 1);
    //console.log(sixMonthsAgo);
    const startDateCommits = dateEarliestCommit > sixMonthsAgo ? dateEarliestCommit : sixMonthsAgo;
    const startDateIssues = dateEarliestIssue > sixMonthsAgo ? dateEarliestIssue : sixMonthsAgo;

    // current date
    const currentDate = new Date();
    // constant value to convert time difference to weeks
    const millisecondsInAWeek = 1000 * 60 * 60 * 24 * 7;

    // Calculate = number of issues closed in the past 6 months that were opened in the past 6 months / number of issues created in the past 6 months
    const issues = metric.issuesData;
    //const issuesCurrentlyOpen = issues.filter(issue => issue.state === 'open');
    const issuesOpenedPast6Months = issues.filter(issue => new Date(issue.created_at) >= startDateIssues);
    const closedIssuesPast6Months = issuesOpenedPast6Months.filter(issue => issue.state === 'closed');
    
    if (issuesOpenedPast6Months.length === 0 || closedIssuesPast6Months.length === 0) {
      avgWeeksNotLostXReciprocalWeeks = 0;
      ratioClosedToOpenIssues = 0;
    }
    else {
      // Calculate avg week to close an issue
      ratioClosedToOpenIssues = closedIssuesPast6Months.length / issuesOpenedPast6Months.length;
      const totalTimeToCloseIssues = closedIssuesPast6Months.reduce((total, issue) => total + (new Date(issue.closed_at).getTime() - new Date(issue.created_at).getTime()), 0);
      const avgWeeksToCloseIssue = (totalTimeToCloseIssues / millisecondsInAWeek) / closedIssuesPast6Months.length;
      //console.log('closed issues', closedIssuesPast6Months.length);
      //console.log(`Avg Weeks to Close Issue: ${avgWeeksToCloseIssue}`);
      // get current date

      // calculate avg weeks not lost x reciprocal weeks
      const timeDifferenceIssues = currentDate.getTime() - startDateIssues.getTime();
      const weeksDifferenceIssues = Math.ceil(timeDifferenceIssues / millisecondsInAWeek);
      avgWeeksNotLostXReciprocalWeeks = (weeksDifferenceIssues - avgWeeksToCloseIssue) * (1 / weeksDifferenceIssues);
    }
  }
  // compute static analysis score: wait for later
  // const staticAnalysisScore = await helpers._getLintScore(clonedPath);

  // compute issue ratio
  return 0.5 * testCoverageScore +  0.5 * issueRatio;
}

export{calculateCorrectness};