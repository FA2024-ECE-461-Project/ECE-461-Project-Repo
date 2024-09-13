import {getGithubInfo, RepoDetails} from '../apiProcess/gitApiProcess';
import {getNpmPackageInfo} from '../apiProcess/npmApiProcess';
import {calculateRampUpTime} from './rampUpTime';
import {calculateResponsiveness} from './responsiveness';
import {calculateLicenseCompatibility} from './licenseCompatibility';
import {calculateBusFactor} from './busFactor';
import {calculateCorrectness} from './correctness';

//print the number of stars for the given repository
export async function GetNetScore(owner: string, repo: string, packageName: string): Promise<void> {
  try {
    console.log ('\nFetching data from github\n ');
    const gitInfo = await getGithubInfo(owner, repo);
    //print the number of stars for the given repository
    console.log(`The repository ${owner}/${repo} has ${gitInfo.stars} stars.`);
    //print the number of issues for the given repository
    console.log(`The repository ${owner}/${repo} has ${gitInfo.issues} Issues.`);
    //print the number of pull requests for the given repository
    console.log(`The repository ${owner}/${repo} has ${gitInfo.pullRequests} PullRequests.`);
    //print the number of forks for the given repository
    console.log(`The repository ${owner}/${repo} has ${gitInfo.forks} Forks.`);
    //print the license for the given repository
    console.log(`The repository ${owner}/${repo} has ${gitInfo.license} License.`);
    
    // get metrics values
    const rampUpTime = calculateRampUpTime(gitInfo);
    const responsiveness = calculateResponsiveness(gitInfo);
    const licenseCompatibility = calculateLicenseCompatibility(gitInfo);
    const busFactor = calculateBusFactor(gitInfo);
    const correctnessScore = calculateCorrectness(gitInfo);
    
    //return a JDSON object with the metrics values
    return 
  } catch (error) {
    console.error('GetNetScore: Failed to get repository info:', error);
  }

  console.log('******************************************************************************************');




}