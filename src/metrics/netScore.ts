import {getGithubInfo, RepoDetails} from '../apiProcess/gitApiProcess';

//print the number of stars for the given repository
export async function GetNetScore(owner: string, repo: string): Promise<void> {
    try {
      const info = await getGithubInfo(owner, repo);
      //print the number of stars for the given repository
      console.log(`The repository ${owner}/${repo} has ${info.stars} stars.`);
      //print the number of issues for the given repository
      console.log(`The repository ${owner}/${repo} has ${info.issues} Issues.`);
      //print the number of pull requests for the given repository
      console.log(`The repository ${owner}/${repo} has ${info.pullRequests} PullRequests.`);
      //print the number of forks for the given repository
      console.log(`The repository ${owner}/${repo} has ${info.forks} Forks.`);
      //print the license for the given repository
      console.log(`The repository ${owner}/${repo} has ${info.license} License.`);
    } catch (error) {
      console.error('Failed to get repository stars:', error);
    }
  
  }
  