import {getGithubInfo, RepoDetails} from '../apiProcess/gitApiProcess';
import {calculateRampUpTime} from './rampUpTime';
import {calculateResponsiveness} from './responsiveness';
import {calculateLicenseCompatibility} from './licenseCompatibility';
import {calculateBusFactor} from './busFactor';
// import {calculateCorrectness} from './correctness';
import { promisify } from 'util';

async function measureLatency<T, A extends any[]>(
  fn: (...args: A) => Promise<T> | T,
  ...args: A
): Promise<{ value: T; latency: number }> {
  const startTime = process.hrtime();
  const value = await fn(...args);
  const elapsedTime = process.hrtime(startTime);
  const latency = elapsedTime[0] + elapsedTime[1] / 1e9; // Convert to seconds
  return { value, latency };
}

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
    const rampUpTime = await measureLatency(calculateRampUpTime, gitInfo) //calculateRampUpTime(gitInfo);
    const responsiveness = await measureLatency(calculateResponsiveness,gitInfo);
    const licenseCompatibility = await measureLatency(calculateLicenseCompatibility,gitInfo);
    //console.log(licenseCompatibility)
    const busFactor = await measureLatency(calculateBusFactor,gitInfo);
    // const correctnessScore = await measureLatency(calculateCorrectness,gitInfo);
    const correctnessScore = 0.5

    //calculate the NetScore
    const NetScore = correctnessScore + busFactor.value + licenseCompatibility.value + responsiveness.value + rampUpTime.value;

    // Return a JSON object with the metrics values
    return {
      URL: url,
      NetScore: NetScore,
      NetScore_Latency: 100, // Example latency value, replace with actual if available
      RampUp: rampUpTime.value,
      RampUp_Latency: rampUpTime.latency, // Example latency value, replace with actual if available
      // Correctness: correctnessScore.value,
      // Correctness_Latency: correctnessScore.latency, // Example latency value, replace with actual if available
      BusFactor: busFactor.value,
      BusFactor_Latency: busFactor.latency, // Example latency value, replace with actual if available
      ResponsiveMaintainer: responsiveness.value,
      ResponsiveMaintainer_Latency: responsiveness.latency, // Example latency value, replace with actual if available
      License: licenseCompatibility.value,
      License_Latency: licenseCompatibility.latency // Example latency value, replace with actual if available
    };
  } catch (error) {
    console.error('GetNetScore: Failed to get repository info:', error);
    return null;
  }
}

