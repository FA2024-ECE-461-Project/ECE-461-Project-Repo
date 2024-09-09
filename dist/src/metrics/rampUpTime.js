"use strict";
//Calcualte Ramp Up Time
// import axios from 'axios';
// export async function calculateRampUpTime(owner: string, repo: string, token: string) {
//     const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`, {
//         headers: { 'Authorization': `token ${token}` }
//     });
//     const readmeSize = response.data.size;
//     const rampUpScore = Math.min(1, 10000 / readmeSize);
//     return { metric: "RampUp", score: rampUpScore };
// }
