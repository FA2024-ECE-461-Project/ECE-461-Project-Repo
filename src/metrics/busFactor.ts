//Calculate busFactor
import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from a .env file into process.env
import axios from 'axios';

import {RepoDetails} from '../apiProcess/gitApiProcess';

export function calculateBusFactor(metrics: RepoDetails): number {
  
  // Check if there are any commits available
  if (!metrics.commitsData) {
    console.error('No commits data available for calculating bus factor');
    return 0;
  }

  // Get commit counts for each user, ignore all anonymous/unknown authors
  const commitCounts: { [key: string]: number } = {};
  metrics.commitsData.forEach((commit: any) => {
    const author = commit.author ? (commit.author.login ? commit.author.login : commit.author.name) : 'unknown';
    if(author != 'unknown') {
      if (!commitCounts[author]) {
        commitCounts[author] = 0;
      }
      commitCounts[author]++;
    }
  });

  //console.log('Commit Counts:', commitCounts);

  const totalCommits = Object.values(commitCounts).reduce((sum, count) => sum + count, 0);
  const totalContributors = Object.keys(commitCounts).length;
  const commitsForCoreContributors = 0.1 * totalCommits;
  const thresholdContributors = 0.25 * totalContributors;
  //console.log('Threshold:', thresholdContributors);

  // Filter core contributors if they have >= 10% of total commits
  const coreContributors = Object.values(commitCounts).filter(count => count >= commitsForCoreContributors).length;
  //console.log('Core Contributors:', coreContributors);
  const coreContributorsRatio = coreContributors / thresholdContributors;

  return Math.min(Math.max(coreContributorsRatio, 0), 1);
}


