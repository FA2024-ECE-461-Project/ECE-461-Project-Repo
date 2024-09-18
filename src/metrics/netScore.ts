import {getGithubInfo, RepoDetails} from '../apiProcess/gitApiProcess';
import {calculateRampUpTime} from './rampUpTime';
import {calculateResponsiveness} from './responsiveness';
import {calculateLicenseCompatibility} from './licenseCompatibility';
import {calculateBusFactor} from './busFactor';
// import {calculateCorrectness} from './correctness';
import * as git from 'isomorphic-git';
import * as http from 'isomorphic-git/http/node';
import * as fs from 'fs';
import * as path from 'path';

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
  let dir: string | undefined;
  try {
    // console.log('\nFetching data from GitHub\n');
    const gitInfo = await getGithubInfo(owner, repo);
    if (!gitInfo) {
      console.error('Failed to get repository info');
      return null;
    }

    const repoUrl = `https://github.com/${owner}/${repo}.git`;
    console.log('Cloning repository:', repoUrl);

    dir = path.join(process.cwd(), 'tmp', `repo-${Date.now()}`);
    fs.mkdirSync(dir, { recursive: true });

    try {
      // Clone the repository with shallow clone
      await git.clone({
        fs,
        http,
        dir,
        url: repoUrl,
        singleBranch: true,
        depth: 1, // Only the latest commit
      });
    } catch (cloneError) {
      console.error('Error cloning repository:', cloneError);
      // If cloning fails, we can't proceed further
      return null;
    }

    const rampUpTime = await measureLatency(calculateRampUpTime, gitInfo, dir);
    const responsiveness = await measureLatency(calculateResponsiveness,gitInfo);
    const licenseCompatibility = await measureLatency(calculateLicenseCompatibility,gitInfo);
    //console.log(licenseCompatibility)
    const busFactor = await measureLatency(calculateBusFactor,gitInfo);
    // const correctnessScore = await measureLatency(calculateCorrectness,gitInfo);
    const correctnessScore = 0.5

    //calculate the NetScore
    //const NetScore = correctnessScore + busFactor.value + licenseCompatibility.value + responsiveness.value + rampUpTime.value;

    // Return a JSON object with the metrics values
    return {
      URL: url,
      NetScore: 0,
      NetScore_Latency: 100, // Example latency value, replace with actual if available
      RampUp: rampUpTime.value,
      RampUp_Latency: rampUpTime.latency, // Example latency value, replace with actual if available
      Correctness: 0,
      Correctness_Latency: 0, // Example latency value, replace with actual if available
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
  }  finally {
    // Clean up: delete the cloned repository
    if (dir && fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
}

