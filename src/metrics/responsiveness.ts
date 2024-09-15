//Calculate Responsiveness
import { time } from 'node:console';
import {RepoDetails} from '../apiProcess/gitApiProcess';

export function calculateResponsiveness(metrics: RepoDetails): number {
  // Default Values
  let ratioClosedToOpenIssues = 0;
  let avgWeeksNotLostXReciprocalWeeks = 0;
  let commitFreqRatio = 0;
  let responsiveness = 0;

  // Check if there are any issues available
  if (!metrics.issuesData) {
    console.error('No issues data available for calculating responsiveness');
    return 0;
  }

  // Check if there are any commits available
  if (!metrics.commitsData) {
    console.error('No commits data available for calculating responsiveness');
    return 0;
  }

  // Determine the start date for the 6-month period (or less if not enough data)
  const repoCreationDate = new Date(metrics.created_at);
  const dateEarliestCommit = new Date(metrics.commitsData[metrics.commitsData.length - 1].commit.author.date);
  const dateEarliestIssue = new Date(metrics.issuesData[metrics.issuesData.length - 1].created_at);
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
  const issues = metrics.issuesData;
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
  //console.log('timeDiffIssues', timeDifferenceIssues);
  //console.log('weeksDifferenceIssues:', weeksDifferenceIssues);
  //const rec = 1 / weeksDifferenceIssues;
  //console.log('rec:', rec);
  //const avgweeknotlost = (weeksDifferenceIssues - avgWeeksToCloseIssue);
  //console.log('avgweeknotlost:', avgweeknotlost);

  // calculate weeks difference between start date and current date for commits
  const timeDifferenceCommits = currentDate.getTime() - startDateCommits.getTime();
  const weeksDifferenceCommits = Math.ceil(timeDifferenceCommits / millisecondsInAWeek);

  // calculate commit frequency ratio
  const baselineAvgCommitFreqPerWeek = 10;
  const avgCommitsPerWeek = metrics.commitsData.length / weeksDifferenceCommits;
  commitFreqRatio = Math.min(Math.max(avgCommitsPerWeek / baselineAvgCommitFreqPerWeek, 0), 1);
  //console.log(`Avg Commits Per Week: ${(metrics.commitsData.length / weeksDifferenceCommits)}`);
  //console.log(`Commit Frequency Ratio: ${commitFreqRatio}`);

  //console.debug(`Issues currently open: ${issuesCurrentlyOpen.length}`);
  //console.debug(`Issues opened in the past 6 months: ${issuesOpenedPast6Months.length}`);
  //console.debug(`Issues closed in the past 6 months: ${closedIssuesPast6Months.length}`);
  //console.debug(`RatioClosedToOpenIssues: ${ratioClosedToOpenIssues}`);
  //console.debug(`avgWeeksNotLostXReciprocalWeeks: ${avgWeeksNotLostXReciprocalWeeks}`);

  responsiveness = 0.5 * ratioClosedToOpenIssues + 0.25 * avgWeeksNotLostXReciprocalWeeks + 0.25 * commitFreqRatio;
  return Math.min(Math.max(responsiveness, 0), 1);
}