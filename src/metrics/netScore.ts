import {getGithubInfo, RepoDetails} from '../apiProcess/gitApiProcess';
import {calculateRampUpTime} from './rampUpTime';
import {calculateResponsiveness} from './responsiveness';
import {calculateLicenseCompatibility} from './licenseCompatibility';
import {calculateBusFactor} from './busFactor';
import {calculateCorrectness} from './correctness';

export async function GetNetScore(owner: string, repo: string, url: string): Promise<any> {
  try {
    // console.log('\nFetching data from GitHub\n');
    const gitInfo = await getGithubInfo(owner, repo);

    // // Print repository information
    // console.log(`The repository ${owner}/${repo} has ${gitInfo.stars} stars.`);
    // console.log(`The repository ${owner}/${repo} has ${gitInfo.issues} Issues.`);
    // console.log(`The repository ${owner}/${repo} has ${gitInfo.pullRequests} PullRequests.`);
    // console.log(`The repository ${owner}/${repo} has ${gitInfo.forks} Forks.`);
    // console.log(`The repository ${owner}/${repo} has ${gitInfo.license} License.`);
    // console.log(`The repository ${owner}/${repo} has ${gitInfo.description} Description.`);

    // Get metrics values
    const rampUpTime = calculateRampUpTime(gitInfo);
    const responsiveness = calculateResponsiveness(gitInfo);
    const licenseCompatibility = calculateLicenseCompatibility(gitInfo);
    const busFactor = calculateBusFactor(gitInfo);
    const correctnessScore = calculateCorrectness(gitInfo);

    //calculate the NetScore
    const NetScore = correctnessScore + busFactor + licenseCompatibility + responsiveness + rampUpTime

    // Return a JSON object with the metrics values
    return {
      URL: url,
      NetScore: NetScore,
      NetScore_Latency: 0.033, // Example latency value, replace with actual if available
      RampUp: rampUpTime,
      RampUp_Latency: 0.023, // Example latency value, replace with actual if available
      Correctness: correctnessScore,
      Correctness_Latency: 0.005, // Example latency value, replace with actual if available
      BusFactor: busFactor,
      BusFactor_Latency: 0.002, // Example latency value, replace with actual if available
      ResponsiveMaintainer: responsiveness,
      ResponsiveMaintainer_Latency: 0.002, // Example latency value, replace with actual if available
      License: licenseCompatibility,
      License_Latency: 0.001 // Example latency value, replace with actual if available
    };
  } catch (error) {
    console.error('GetNetScore: Failed to get repository info:', error);
    return null;
  }
}