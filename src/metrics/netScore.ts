import {getGithubInfo, RepoDetails} from '../apiProcess/gitApiProcess';
import {calculateRampUpTime} from './rampUpTime';
import {calculateResponsiveness} from './responsiveness';
import {calculateLicenseCompatibility} from './licenseCompatibility';
import {calculateBusFactor} from './busFactor';
import {calculateCorrectness} from './correctness';
import { log } from '../logger';
import { cloneRepo, removeRepo } from './clone_repo';
// import {calculateCorrectness} from './correctness';
import * as git from 'isomorphic-git';
import * as http from 'isomorphic-git/http/node';
import * as fs from 'fs';
import * as path from 'path';
import { assert } from 'console';

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

    // Clone the repository
    const clonedPath = await cloneRepo(repoUrl);
    const rampUpTime = await measureLatency(calculateRampUpTime, gitInfo, clonedPath);
    const responsiveness = await measureLatency(calculateResponsiveness,gitInfo);
    const licenseCompatibility = await measureLatency(calculateLicenseCompatibility,gitInfo);
    const busFactor = await measureLatency(calculateBusFactor,gitInfo);
    const correctnessScore = {value:0, latency: 0};//await measureLatency(calculateCorrectness, gitInfo, clonedPath);
    const removeResult = await removeRepo(clonedPath);
    assert(removeResult, 'Failed to remove cloned repository');
    //calculate the NetScore
    const NetScore = (0.2)*correctnessScore.value + (0.2)*busFactor.value + (0.1)*licenseCompatibility.value + 
                        (0.3)*responsiveness.value + (0.2)*rampUpTime.value;

    // Return a JSON object with the metrics values
    return {
      URL: url,
      NetScore: NetScore,
      NetScore_Latency: -1, // Example latency value, replace with actual if available
      RampUp: rampUpTime.value,
      RampUp_Latency: rampUpTime.latency, // Example latency value, replace with actual if available
      Correctness: correctnessScore.value,
      Correctness_Latency: correctnessScore.latency, // Example latency value, replace with actual if available
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

