//calculate correctness
import {RepoDetails} from '../apiProcess/gitApiProcess';

export function calculateCorrectness(metrics: RepoDetails): number {
    // Normalize metrics (example normalization, adjust as needed)
    const maxStars = 100000; // Example max value for normalization
    const maxIssues = 1000; // Example max value for normalization
    const maxPullRequests = 500; // Example max value for normalization
    const maxForks = 50000; // Example max value for normalization
  
    const normalizedStars = Math.min(metrics.stars / maxStars, 1);
    const normalizedIssues = 1 - Math.min(metrics.issues / maxIssues, 1); // Inverse, fewer issues is better
    const normalizedPullRequests = Math.min(metrics.pullRequests / maxPullRequests, 1);
    const normalizedForks = Math.min(metrics.forks / maxForks, 1);
  
    // Combine normalized metrics into a single score
    const correctnessScore = (normalizedStars + normalizedIssues + normalizedPullRequests + normalizedForks) / 4;
  
    return correctnessScore;
  }