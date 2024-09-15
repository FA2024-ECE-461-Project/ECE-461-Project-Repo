//Calculate Responsiveness// Calculate responsiveness
import { start } from 'repl';
import {RepoDetails} from '../apiProcess/gitApiProcess';

export function calculateResponsiveness(metrics: RepoDetails): number {
  let ratioClosedToOpenIssues = 0;
  let avgWeeksNotLostXReciprocalWeeks = 0;
  let commitFreqRatio = 0;

  let responsiveness = 0;
  // Check if there are any issues available
  if (!metrics.issuesData) {
    console.error('No issues data available for calculating responsiveness');
    return 0;
  }

  if (!metrics.commitsData) {
    console.error('No issues data available for calculating responsiveness');
    return 0;
  }

  // Determine the start date for the 6-month period (or less if the repo was created less than 6 months ago)
  const repoCreationDate = new Date(metrics.created_at);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const startDate = repoCreationDate > sixMonthsAgo ? repoCreationDate : sixMonthsAgo;

  // Calculate = number of issues closed in the past 6 months that were opened in the past 6 months / number of issues created in the past 6 months
  const issues = metrics.issuesData;
  //const issuesCurrentlyOpen = issues.filter(issue => issue.state === 'open');
  const issuesOpenedPast6Months = issues.filter(issue => new Date(issue.created_at) >= startDate);
  const closedIssuesPast6Months = issuesOpenedPast6Months.filter(issue => issue.state === 'closed');
  ratioClosedToOpenIssues = closedIssuesPast6Months.length / issuesOpenedPast6Months.length;

  const millisecondsInAWeek = 1000 * 60 * 60 * 24 * 7;

  const totalTimeToCloseIssues = closedIssuesPast6Months.reduce((total, issue) => total + (new Date(issue.closed_at).getTime() - new Date(issue.created_at).getTime()), 0);
  const avgWeeksToCloseIssue = closedIssuesPast6Months.length > 0 ? (totalTimeToCloseIssues / closedIssuesPast6Months.length) / millisecondsInAWeek: 0;

  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - startDate.getTime();
  const weeksDifference = Math.floor(timeDifference / millisecondsInAWeek);
  avgWeeksNotLostXReciprocalWeeks = (weeksDifference - avgWeeksToCloseIssue) * (1 / weeksDifference);

  //console.debug(`Issues currently open: ${issuesCurrentlyOpen.length}`);
  //console.debug(`Issues opened in the past 6 months: ${issuesOpenedPast6Months.length}`);
  //console.debug(`Issues closed in the past 6 months: ${closedIssuesPast6Months.length}`);
  //console.debug(`RatioClosedToOpenIssues: ${ratioClosedToOpenIssues}`);
  //console.debug(`avgWeeksNotLostXReciprocalWeeks: ${avgWeeksNotLostXReciprocalWeeks}`);

  const baselineAvgCommitFreq = 0.5;

  responsiveness = 0.5 * ratioClosedToOpenIssues + 0.25 * avgWeeksNotLostXReciprocalWeeks + 0.25 * commitFreqRatio;
  return Math.min(Math.max(responsiveness, 0), 1);
}