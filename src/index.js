import { execSync } from 'child_process';
import runCommand from 'run-command-promise';

/**
 * Checkout the develop branch
 *
 * @return {Promise} Promise that resovles when done
 */
export function checkoutDevelop() {
  return runCommand('git checkout develop');
}

/**
 * Create a release branch with a given version
 *
 * @param  {string} version Version name of the release branch
 * @return {Promise}         Promise that resolves when complete
 */
export function createReleaseBranch(version) {
  return runCommand(`git checkout -b release/${version} develop`);
}

/**
 * Create a feature branch with a given name
 *
 * @param  {String} name The name of the feature
 * @return {Promise}      Promise that resolves when complete
 */
export function createFeatureBranch(name) {
  return runCommand(`git checkout -b feature/${name} develop`);
}

/**
 * Get an array of all branches based on type: feature, release, hotfix
 *
 * @param  {string} type The type of branches to return, feature, release,
 * hotfix
 * @return {Array}      Array of branches
 */
export function getBranches(type) {
  const rawOutput = execSync('git branch', {
    encoding: 'utf8',
  });

  const branches = [];

  rawOutput.split('\n').forEach((branch) => {
    if (branch.includes(`${type}/`)) {
      branches.push(
        branch
          .replace('* ', '')
          .replace(`${type}/`, '')
          .trim(),
      );
    }
  });

  return branches;
}

/**
 * Finish a release branch
 *
 * @param  {string} release      The release to finish
 * @param  {boolean} shouldDelete Should the release branch be deleted when
 * merged
 * @return {Promise}              Promise that resolves when finished
 */
export function finishRelease(release, shouldDelete) {
  return runCommand('git checkout master')
    .then(() => runCommand(`git merge --no-ff release/${release}`))
    .then(() => runCommand(`git tag -a -m '' v${release}`))
    .then(() => runCommand('git checkout develop'))
    .then(() => runCommand(`git merge --no-ff release/${release}`))
    .then(() => {
      if (shouldDelete) {
        return runCommand(`git branch -d release/${release}`);
      }

      return true;
    });
}

/**
 * Finish a specific feature branch
 *
 * @param  {String} feature      The feature to finish
 * @param  {Boolean} shouldDelete Whether to delete the feature branch when
 * finished
 * @return {Promise}              Promise to resolve when finished
 */
export function finishFeature(feature, shouldDelete) {
  return runCommand('git checkout develop')
    .then(() => runCommand(`git merge --no-ff feature/${feature}`))
    .then(() => {
      if (shouldDelete) {
        return runCommand(`git branch -d feature/${feature}`);
      }

      return true;
    });
}

/**
 * Get the current branch name
 *
 * @return {String} The current branch
 */
export function getBranchName() {
  return execSync('git rev-parse --abbrev-ref HEAD', {
    encoding: 'utf8',
  }).trim();
}

/**
 * Finish a branch of a given type
 *
 * @param  {String} branch       The branch to finish
 * @param  {String} type         The type of branch to finish: feature, release,
 * hotfix
 * @param  {Boolean} shouldDelete Whether to delete the branch when finished
 * @return {Promise}              Promise that resolves when finished
 */
export function finishBranch(branch, type, shouldDelete) {
  switch (type) {
    case 'feature':
      return finishFeature(branch, shouldDelete);
    case 'release':
      return finishRelease(branch, shouldDelete);

    default:
      throw new Error('Undefined type of branch');
  }
}
