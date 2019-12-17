const core = require('@actions/core')
const { GitHub, context } = require('@actions/github')

process.on('unhandledRejection', handleError)
main().catch(handleError)

async function main() {
    const token = core.getInput('github-token', { required: true })
    const debug = core.getInput('debug')
    const owner = core.getInput('owner', { required: true })
    const repo = core.getInput('repo', { required: true })
    const tag = core.getInput('tag')
    const directory = core.getInput('dir-path')
    const assetName = core.getInput('asset-name')
    const opts = {}
    if (debug === 'true') opts.log = console
    const github = new GitHub(token, opts)
    const result = await process(github, token, owner, repo, tag, directory, assetName)
    core.setOutput('result', JSON.stringify(result))
}

async function process(github, token, owner, repo, tag, directory, assetName) {
    const fs = require('fs');
    const path = require('path');
    const Octokit = require('@octokit/rest')

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

    const asset = assets.data.filter(asset => asset.name == assetName)[0];
    const zipPath = path.resolve(directory, asset.name);

    const octokit = new Octokit()
    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/octet-stream'
      }
    }
    
    const fetch = require('node-fetch');
    const url = `https://api.github.com/repos/${owner}/${repo}/releases/assets/${asset.id}?access_token=${token}`

    fetch(url, options)
      .then(res => {
        const dest = fs.createWriteStream(zipPath);
        res.body.pipe(dest);
      });
}

function handleError(err) {
    console.error(err)
    core.setFailed(err.message)
}





