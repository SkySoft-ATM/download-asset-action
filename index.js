const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

async function getAsset(github, owner, repo, tag, assetName) {
  const release = await github.repos.getReleaseByTag({
    owner,
    repo,
    tag
  });

  const assets = await github.repos.listAssetsForRelease({
    owner,
    repo,
    release_id: release.data.id
  });

  return assets.data.filter(asset => asset.name == assetName)[0];
}

async function run() {
  try {
    const token = core.getInput('github-token', { required: true });
    const debug = core.getInput('debug');
    const owner = core.getInput('owner', { required: true });
    const repo = core.getInput('repo', { required: true });
    const tag = core.getInput('tag');
    const directory = core.getInput('dir-path');
    const assetName = core.getInput('asset-name');
    const opts = {}
    if (debug === 'true') opts.log = console;

    core.info(`Owner: ${owner}`);
    core.info(`Repo: ${repo}`);
    core.info(`Tag: ${tag}`);
    core.info(`Directory: ${directory}`);
    core.info(`Asset Name: ${assetName}`);

    const github = new GitHub(token, opts);

    const asset = await getAsset(github, owner, repo, tag, assetName);
    const filePath = path.resolve(directory, asset.name);

    const result = await download(token, owner, repo, asset, filePath);
    console.log(`::set-output name=file::${filePath}`);

  } catch (error) {
    core.setFailed(error.message);
  }
}

async function download(token, owner, repo, asset, filePath) {

  const options = {
    method: 'GET',
    headers: {
      Accept: 'application/octet-stream'
    }
  };

  const url = `https://api.github.com/repos/${owner}/${repo}/releases/assets/${asset.id}?access_token=${token}`;
  fetch(url, options)
    .then(checkStatus)
    .then(res => {
      const dest = fs.createWriteStream(filePath);
      res.body.pipe(dest);
    });
}

function checkStatus(res) {
  if (res.ok) {
    return res;
  } else {
    throw new Error(res.statusText);
  }
}

run();
