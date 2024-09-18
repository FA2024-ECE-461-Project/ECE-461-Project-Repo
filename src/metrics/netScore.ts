import {getGithubInfo, RepoDetails} from '../apiProcess/gitApiProcess';
import {calculateRampUpTime} from './rampUpTime';
import {calculateResponsiveness} from './responsiveness';
import {calculateLicenseCompatibility} from './licenseCompatibility';
import {calculateBusFactor} from './busFactor';
import {calculateCorrectness} from './correctness';
import { cloneRepo, removeRepo } from './clone_repo';
import * as fs from 'fs';
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
  //get start time
  const start = new Date().getTime();
  
  let dir: string | undefined;
  try {
    // console.log('\nFetching data from GitHub\n');
    const gitInfo = await getGithubInfo(owner, repo);
    if (!gitInfo) {
      console.error('Failed to get repository info');
      return null;
    }

    //get api time
    let api_time = (new Date().getTime() - start) / 1000;
    
    const repoUrl = `https://github.com/${owner}/${repo}.git`;
    console.log('Cloning repository:', repoUrl);

    const start_clone = new Date().getTime();
    // Clone the repository
    const clonedPath = await cloneRepo(repoUrl);
    //get clone time
    let clone_time = (new Date().getTime() - start_clone) / 1000;

    const rampUpTime = await measureLatency(calculateRampUpTime, gitInfo, clonedPath);
    const responsiveness = await measureLatency(calculateResponsiveness,gitInfo);
    const licenseCompatibility = await measureLatency(calculateLicenseCompatibility,gitInfo);
    const busFactor = await measureLatency(calculateBusFactor,gitInfo);
    const correctnessScore = {value:0, latency: 0}; //await measureLatency(calculateCorrectness, gitInfo, clonedPath);
    const removeResult = await removeRepo(clonedPath);
    assert(removeResult, 'Failed to remove cloned repository');
    //calculate the NetScore
    const NetScore = (0.2)*correctnessScore.value + (0.2)*busFactor.value + (0.1)*licenseCompatibility.value + 
    (0.3)*responsiveness.value + (0.2)*rampUpTime.value;
    //get end time
    let net_time = (new Date().getTime() - start) / 1000;


    // Return a JSON object with the metrics values
    return {
      URL: url,
      NetScore: parseFloat(NetScore.toFixed(3)),
      NetScore_Latency: parseFloat(net_time.toFixed(3)), // Example latency value, replace with actual if available
      RampUp: parseFloat(rampUpTime.value.toFixed(3)),
      RampUp_Latency: parseFloat((rampUpTime.latency + api_time + clone_time).toFixed(3)), // Example latency value, replace with actual if available
      Correctness: parseFloat(correctnessScore.value.toFixed(3)),
      Correctness_Latency: parseFloat((correctnessScore.latency + api_time + clone_time).toFixed(3)), // Example latency value, replace with actual if available
      BusFactor: parseFloat(busFactor.value.toFixed(3)),
      BusFactor_Latency: parseFloat((busFactor.latency + api_time).toFixed(3)), // Example latency value, replace with actual if available
      ResponsiveMaintainer: parseFloat(responsiveness.value.toFixed(3)),
      ResponsiveMaintainer_Latency: parseFloat((responsiveness.latency + api_time).toFixed(3)), // Example latency value, replace with actual if available
      License: parseFloat(licenseCompatibility.value.toFixed(3)),
      License_Latency: parseFloat((licenseCompatibility.latency + api_time).toFixed(3)) // Example latency value, replace with actual if available
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

