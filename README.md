# download-asset-action

This action makes it easy to quickly download a github asset in your workflow 
using the GitHub API.

In order to use this action, a set of elements need to be provided. 

**Note** This action is still release candidat and the API may change in
future versions. 🙂

## Examples

### Download a archive file, part of a Github Release

```yaml
on: [push]

jobs:
  retrieve:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-asset-action@master
        with:
          github-token: ${{secrets.GITHUB_TOKEN}}
          owner: "SkySoft-ATM"
          repo: "my-repo"
          tag: "v1.0"
          asset-name: "asset.zip"
          dir: "./"          
```

