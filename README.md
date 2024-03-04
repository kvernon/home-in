# home-in

We want to hone-in on data around realty, so we have the _home-in_ API. Lots of puns / dad jokes around it. Plus there's
a whole which is right debate! Either way, enjoy.

## Getting setup

### Node Version Manager and Packager Setup

1. nvm / nvs
2. https://pnpm.io/installation

### Get Dependencies

`$ pnpm install`

### Run tests

`$ pnpm tests`

> ☝️This can run using Wallaby.js in automatic config

### CI/CD (Delivery)

This project _sports_ a non gitflow workflow.

#### Branches

`main` and `feature/*`

#### The (CI/CD) Flow

Once a feature's PR is merged, the pipeline will run checks and publish.

```bash
pnpm bundle:aws --APIKey=foo --RapidAPIKey=foo2 --RapidAPISecret=foo3
```

## APIs

- https://rapidapi.com/apidojo/api/realty-in-us

## Releases

1. https://github.com/changesets/changesets

### Branching (Pre-Release)

1. create a [pre-release](https://github.com/changesets/changesets/blob/main/docs/prereleases.md) by starting the process: `pnpm changeset pre enter next`
2. next tell it you want to version it: `pnpm changeset version`
3. do your commit(s) related to it
4. finally wrap it up: `pnpm changeset publish`

### Merging and the master/main

1. ensure you're not in a pre-release: `pnpm changeset pre exit`
2. version this release: `pnpm changeset version`
3. do your commit(s)
4. `pnpm changeset publish`
5. git push --follow-tags
