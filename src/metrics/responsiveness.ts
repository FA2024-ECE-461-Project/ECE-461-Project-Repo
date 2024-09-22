import { RepoDetails } from "../apiProcess/gitApiProcess";
import { log } from "../logger";

/*
  Function Name: calculateResponsiveness
  Description: This function calculates the responsiveness score of a repository
  @params: metrics: RepoDetails - the returned output from getGithubInfo(...)
  @returns: score between 0 and 1 evaluated from:
  - ratio of closed to open issues
  - average weeks not lost x reciprocal weeks
  - commit frequency ratio
*/
export function calculateResponsiveness(metrics: RepoDetails): number {
  log.info(
    "In calculateResponsiveness, starting to calculate responsiveness...",
  );

  // Setting default Values
  let ratioClosedToOpenIssues = 0;
  let avgWeeksNotLostXReciprocalWeeks = 0;
  let commitFreqRatio = 0;
  let responsiveness = 0;

  // get date for 6 months ago
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // get current date
  const currentDate = new Date();
  // constant value to convert time difference to weeks
  const millisecondsInAWeek = 1000 * 60 * 60 * 24 * 7;

  log.info("In calculateResponsiveness, calculating commit frequency ratio...");
  // Check if there are any issues available
  log.debug("Number of commits available:", metrics.commitsData.length);
  if (metrics.commitsData.length != 0) {
    // Determine the start date for the 6-month period (or less if not enough data)
    const dateEarliestCommit = new Date(
      metrics.commitsData[metrics.commitsData.length - 1].commit.author.date,
    );

    // Set start date for commits
    const startDateCommits =
      dateEarliestCommit > sixMonthsAgo ? dateEarliestCommit : sixMonthsAgo;

    // Filter commits from the start date
    const commitsFromStartDate = metrics.commitsData.filter(
      (commit) => new Date(commit.commit.author.date) >= startDateCommits,
    );

    // calculate weeks difference between start date and current date for commits
    const weeksDifferenceCommits = _calculateWeeksDifference(
      currentDate,
      startDateCommits,
      millisecondsInAWeek,
    );

    // calculate commit frequency ratio
    const baselineAvgCommitFreqPerWeek = 10;
    const avgCommitsPerWeek =
      commitsFromStartDate.length / weeksDifferenceCommits;
    commitFreqRatio = Math.min(
      Math.max(avgCommitsPerWeek / baselineAvgCommitFreqPerWeek, 0),
      1,
    );
  }
  log.info("Finished calculating Commit Frequency Ratio:");
  log.debug("Commit Frequency Ratio:", commitFreqRatio);

  log.info(
    "In calculateResponsiveness, calculating ratio of closed to open issues...",
  );
  // Check if there are any issues available
  log.debug("Number of issues available:", metrics.issuesData.length);
  if (metrics.issuesData.length != 0) {
    // Determine the start date for the 6-month period (or less if not enough data)
    const dateEarliestIssue = new Date(
      metrics.issuesData[metrics.issuesData.length - 1].created_at,
    );

    const startDateIssues =
      dateEarliestIssue > sixMonthsAgo ? dateEarliestIssue : sixMonthsAgo;

    // Calculate = number of issues closed in the past 6 months that were opened
    //             in the past 6 months / number of issues created in the past 6 months
    const issues = metrics.issuesData;
    const issuesOpenedPast6Months = issues.filter(
      (issue) => new Date(issue.created_at) >= startDateIssues,
    );
    const closedIssuesPast6Months = issuesOpenedPast6Months.filter(
      (issue) => issue.state === "closed",
    );

    if (
      !(
        issuesOpenedPast6Months.length == 0 ||
        closedIssuesPast6Months.length == 0
      )
    ) {
      // Calculate ratio of closed to open issues
      ratioClosedToOpenIssues = _calculateRatioClosedToOpenIssues(
        closedIssuesPast6Months,
        issuesOpenedPast6Months,
      );

      // Calculate total time to close issues
      const totalTimeToCloseIssues = closedIssuesPast6Months.reduce(
        (total, issue) =>
          total +
          (new Date(issue.closed_at).getTime() -
            new Date(issue.created_at).getTime()),
        0,
      );

      // Calculate avg week to close an issue
      const avgWeeksToCloseIssue =
        totalTimeToCloseIssues /
        millisecondsInAWeek /
        closedIssuesPast6Months.length;

      const weeksDifferenceIssues = _calculateWeeksDifference(
        currentDate,
        startDateIssues,
        millisecondsInAWeek,
      );

      // calculate avg weeks not lost x reciprocal weeks
      avgWeeksNotLostXReciprocalWeeks =
        (weeksDifferenceIssues - avgWeeksToCloseIssue) *
        (1 / weeksDifferenceIssues);
    }
  }
  log.info("Finished calculating Ratio of Closed to Open Issues");

  log.debug("Ratio of Closed to Open Issues:", ratioClosedToOpenIssues);
  log.debug(
    "Average Weeks Not Lost * Reciprocal Weeks:",
    avgWeeksNotLostXReciprocalWeeks,
  );

  // Calculate responsiveness score using weights
  responsiveness = Math.min(
    Math.max(
      0.5 * ratioClosedToOpenIssues +
        0.25 * avgWeeksNotLostXReciprocalWeeks +
        0.25 * commitFreqRatio,
      0,
    ),
    1,
  );

  log.debug("Calculated Responsive Maintainer Score:", responsiveness);

  log.info("Finished calculateResponsiveness. Exiting...");
  return responsiveness;
}

/*
  Function Name: _calculateWeeksDifference
  Description: Helper function that calculates the number of weeks difference between the current date and the start date
  @params: currentDate: Date - current date
  @params: startDate: Date - start date
  @params: millisecondsInAWeek: number - constant value to convert time difference to weeks
  @returns: number of weeks difference between the current date and the start date
*/
function _calculateWeeksDifference(
  currentDate: Date,
  startDate: Date,
  millisecondsInAWeek: number,
): number {
  const timeDifferenceCommits = currentDate.getTime() - startDate.getTime();
  let weeksDifference = timeDifferenceCommits / millisecondsInAWeek;
  if (weeksDifference < 1) {
    weeksDifference = 1;
  }
  return weeksDifference;
}

function _calculateRatioClosedToOpenIssues(
  closedIssuesPast6Months: any[],
  issuesOpenedPast6Months: any[],
): number {
  return closedIssuesPast6Months.length / issuesOpenedPast6Months.length;
}
