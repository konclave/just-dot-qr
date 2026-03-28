# Release Automation Design

**Date:** 2026-03-28
**Package:** just-dot-qr
**Tool:** semantic-release

## Goal

Automate versioning, changelog generation, and npm publishing on every push to `main`, driven entirely by conventional commits. No manual release steps.

## Workflow

A single GitHub Actions workflow (`.github/workflows/release.yml`) triggers on push to `main` and runs two sequential jobs:

### Job 1: `ci`
- Install dependencies (`npm ci`)
- Run tests (`npm test`)
- Run build (`npm run build`)

If any step fails, the workflow stops and no release is made.

### Job 2: `release`
- Runs only if `ci` passes (`needs: ci`)
- Executes `npx semantic-release`
- If no releasable commits exist (e.g. only `chore:`), exits cleanly with no release

## semantic-release Behavior

Commit type → semver mapping (strict semver):

| Commit prefix | Release type |
|---|---|
| `fix:` | patch |
| `feat:` | minor |
| `BREAKING CHANGE` footer or `!` | major |
| `chore:`, `docs:`, `style:`, etc. | no release |

On a releasable push, semantic-release will:
1. Determine the next version from commits since last tag
2. Generate changelog content
3. Write/update `CHANGELOG.md`
4. Bump `version` in `package.json`
5. Commit the changelog and version bump back to `main`
6. Create a git tag (e.g. `v1.2.0`)
7. Create a GitHub Release with changelog as release notes
8. Publish the package to npm

## Configuration

Config lives in `package.json` under `"release"` key.

### Plugins (in order)

| Plugin | Purpose |
|---|---|
| `@semantic-release/commit-analyzer` | Maps conventional commits to semver bump type |
| `@semantic-release/release-notes-generator` | Generates release notes from commits |
| `@semantic-release/changelog` | Writes/updates `CHANGELOG.md` |
| `@semantic-release/npm` | Bumps `package.json` version and publishes to npm |
| `@semantic-release/github` | Creates GitHub Release with notes |
| `@semantic-release/git` | Commits `CHANGELOG.md` and `package.json` back to `main` |

## Secrets

| Secret | Source | Purpose |
|---|---|---|
| `NPM_TOKEN` | npm account (Automation token) | Authenticate npm publish |
| `GITHUB_TOKEN` | Provided automatically by GitHub Actions | Create releases, push commits |

## npm Setup (prerequisite)

Since npm is not yet configured:
1. Create an npm account (if not existing)
2. Create/claim the `just-dot-qr` package namespace by publishing a `0.1.0` manually once, or let semantic-release do the first publish (it will create the package automatically if the token has publish rights)
3. Generate an Automation token (bypasses 2FA for CI) under npm account settings
4. Add the token as `NPM_TOKEN` in the GitHub repo's Settings → Secrets and variables → Actions

## Files Changed

- `.github/workflows/release.yml` — new CI + release workflow
- `package.json` — add `"release"` config block, add semantic-release dev dependencies
- `CHANGELOG.md` — created automatically by semantic-release on first run
