//calculate correctness
import * as gitService from '../apiProcess/gitApiProcess';



//print the number of stars for the given repository
export async function printRepoInfo(owner: string, repo: string): Promise<void> {
  try {
    const stars = await gitService.getRepoStars(owner, repo);
    console.log(`The repository ${owner}/${repo} has ${stars} stars.`);
  } catch (error) {
    console.error('Failed to get repository stars:', error);
  }

  try {
    const Issues = await gitService.getRepoIssues(owner, repo);
    console.log(`The repository ${owner}/${repo} has ${Issues} Issues.`);
  } catch (error) {
    console.error('Failed to get repository Issues:', error);
  }

  try {
    const PullRequests = await gitService.getRepoPullRequests(owner, repo);
    console.log(`The repository ${owner}/${repo} has ${PullRequests} PullRequests.`);
  } catch (error) {
    console.error('Failed to get repository PullRequests:', error);
  }

  try {
    const Forks = await gitService.getRepoForks(owner, repo);
    console.log(`The repository ${owner}/${repo} has ${Forks} Forks.`);
  } catch (error) {
    console.error('Failed to get repository Forks:', error);
  }

}

