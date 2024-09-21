//Check if package contain valid license
import { RepoDetails } from "../apiProcess/gitApiProcess";
import { log } from "../logger";
// License map containing SPDX identifiers and their corresponding scores
const licenseScoreMap: { [key: string]: number } = {
  // SPDX and full license names from your list
  "AFL-3.0": 0,
  "Academic Free License v3.0": 0,

  "Apache-2.0": 0.5,
  "Apache License 2.0": 0.5,

  "Artistic-2.0": 1,
  "Artistic License 2.0": 1,

  "BSL-1.0": 1,
  "Boost Software License 1.0": 1,

  "BSD-2-Clause": 1,
  "BSD 2-clause Simplified License": 1,

  "BSD-3-Clause": 1,
  "BSD 3-clause New or Revised License": 1,

  "BSD-3-Clause-Clear": 1,
  "BSD 3-clause Clear License": 1,

  "BSD-4-Clause": 0,
  "BSD 4-clause Original or Old License": 0,

  "0BSD": 1,
  "BSD Zero Clause License": 1,

  CC: 0,
  "Creative Commons License Family": 0,

  "CC0-1.0": 0,
  "Creative Commons Zero v1.0 Universal": 0,

  "CC-BY-4.0": 0,
  "Creative Commons Attribution 4.0": 0,

  "CC-BY-SA-4.0": 0,
  "Creative Commons Attribution ShareAlike 4.0": 0,

  WTFPL: 0.5,
  "Do What The F*ck You Want To Public License": 0.5,

  "ECL-2.0": 0,
  "Educational Community License v2.0": 0,

  "EPL-1.0": 0,
  "Eclipse Public License 1.0": 0,

  "EPL-2.0": 0,
  "Eclipse Public License 2.0": 0,

  "EUPL-1.1": 0,
  "European Union Public License 1.1": 0,

  "AGPL-3.0": 0,
  "GNU Affero General Public License v3.0": 0,

  GPL: 0,
  "GPL-2.0": 0,
  "GPL-3.0": 0,
  "GNU General Public License family": 0,
  "GNU General Public License v2.0": 0,
  "GNU General Public License v3.0": 0,

  LGPL: 0,
  "LGPL-2.1": 1,
  "LGPL-3.0": 0,
  "GNU Lesser General Public License family": 0,
  "GNU Lesser General Public License v2.1": 1,
  "GNU Lesser General Public License v3.0": 0,

  ISC: 1,
  "ISC License": 1,

  "LPPL-1.3c": 0,
  "LaTeX Project Public License v1.3c": 0,

  "MS-PL": 0,
  "Microsoft Public License": 0,

  MIT: 1,
  "MIT License": 1,

  "MPL-2.0": 0,
  "Mozilla Public License 2.0": 0,

  "OSL-3.0": 0,
  "Open Software License 3.0": 0,

  PostgreSQL: 1,
  "PostgreSQL License": 1,

  "OFL-1.1": 0,
  "SIL Open Font License 1.1": 0,

  NCSA: 1,
  "University of Illinois/NCSA Open Source License": 1,

  Unlicense: 1,
  "The Unlicense": 1,

  Zlib: 1,
  "zLib License": 1,
};

/*
  Function Name: calculateLicenseCompatibility
  Description: This function calculates the license compatibility score for a repository based on the license found in the `RepoDetails`.
  @params: 
    - metrics: RepoDetails - The repository details containing the license information.
  @returns: number - The license compatibility score based on the license, or 0 if no valid license is found.
*/
export function calculateLicenseCompatibility(metrics: RepoDetails): number {
  // Extract the license from the RepoDetails object
  log.info(`Calculating license compatibility...`);
  const license = metrics.license;

  // Check if the exact license exists in the licenseScoreMap
  if (license && licenseScoreMap.hasOwnProperty(license)) {
    // Return the score if the license matches
    log.info(`Finished calculating license compatibility. Exiting...`);
    return licenseScoreMap[license];
  }

  // Return 0 if no valid license is found in the map
  log.info(`No valid license found. Exiting...`);
  return 0;
}
