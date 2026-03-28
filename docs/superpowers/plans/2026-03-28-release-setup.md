# Release Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up fully automated versioning, changelog, and npm publishing on push to `main` using semantic-release and GitHub Actions.

**Architecture:** A GitHub Actions workflow runs tests + build first, then semantic-release analyzes conventional commits to determine the next semver version, generates a changelog, publishes to npm, creates a GitHub Release, and commits the version bump back to main — all without manual steps.

**Tech Stack:** semantic-release, GitHub Actions, npm

---

### Task 1: Install semantic-release and plugins

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install dependencies**

```bash
npm install --save-dev \
  semantic-release \
  @semantic-release/changelog \
  @semantic-release/git \
  @semantic-release/github \
  @semantic-release/npm \
  @semantic-release/commit-analyzer \
  @semantic-release/release-notes-generator
```

- [ ] **Step 2: Verify install**

```bash
npx semantic-release --version
```

Expected: prints the semantic-release version (e.g. `24.x.x`)

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install semantic-release and plugins"
```

---

### Task 2: Add semantic-release config to package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add `"release"` block to `package.json`**

Add the following at the top level of `package.json` (alongside `"name"`, `"version"`, etc.):

```json
"release": {
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/changelog",
      {
        "changelogFile": "CHANGELOG.md"
      }
    ],
    "@semantic-release/npm",
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        "assets": ["CHANGELOG.md", "package.json"],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ]
  ]
}
```

Note: `[skip ci]` in the commit message prevents the release commit from re-triggering the workflow.

- [ ] **Step 2: Verify JSON is valid**

```bash
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('valid')"
```

Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add semantic-release config"
```

---

### Task 3: Add `CHANGELOG.md` to `.gitignore` exclusion and prepare repo

**Files:**
- Modify: `.gitignore`

semantic-release will create and commit `CHANGELOG.md` itself on first release. We must ensure it is not gitignored.

- [ ] **Step 1: Check `CHANGELOG.md` is not in `.gitignore`**

```bash
grep -i changelog .gitignore
```

Expected: no output (nothing matched). If `CHANGELOG.md` appears, remove that line.

- [ ] **Step 2: Ensure `package-lock.json` is committed**

```bash
git status package-lock.json
```

Expected: either `nothing to commit` or it appears as modified/new. If modified/new, stage and commit it:

```bash
git add package-lock.json
git commit -m "chore: commit package-lock.json"
```

---

### Task 4: Create GitHub Actions workflow

**Files:**
- Create: `.github/workflows/release.yml`

- [ ] **Step 1: Create directory**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: Create `.github/workflows/release.yml`**

```yaml
name: Release

on:
  push:
    branches:
      - main

jobs:
  ci:
    name: CI
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

  release:
    name: Release
    runs-on: ubuntu-latest
    needs: ci
    permissions:
      contents: write
      issues: write
      pull-requests: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npx semantic-release
```

Key points:
- `fetch-depth: 0` — semantic-release needs full git history to determine the previous tag
- `persist-credentials: false` — required so semantic-release can push the version commit using its own token
- `permissions.contents: write` — required to create tags and releases
- `id-token: write` — required for npm provenance publishing

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci: add GitHub Actions release workflow"
```

---

### Task 5: Set up npm account and token (manual steps)

This task is performed by the human — it cannot be automated.

- [ ] **Step 1: Create an npm account**

Go to https://www.npmjs.com/signup and create an account if you don't have one.

- [ ] **Step 2: Generate an Automation token**

1. Log in to npmjs.com
2. Click your avatar → **Access Tokens**
3. Click **Generate New Token** → **Granular Access Token**
4. Set:
   - Token name: `just-dot-qr-ci`
   - Expiration: your preference (365 days recommended)
   - Packages and scopes: **Read and write** — select `just-dot-qr` (or allow all packages if first publish)
   - Organizations: not required
5. Click **Generate token** and copy the value

- [ ] **Step 3: Add token to GitHub repo secrets**

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `NPM_TOKEN`
4. Value: paste the token from Step 2
5. Click **Add secret**

---

### Task 6: Verify the workflow triggers correctly (dry run)

This task verifies everything is wired up before a real release.

- [ ] **Step 1: Push current state to main**

```bash
git push origin main
```

- [ ] **Step 2: Watch the workflow**

Go to your GitHub repo → **Actions** tab. The `Release` workflow should appear. Verify:
- The `ci` job passes (tests + build green)
- The `release` job runs after `ci`
- Since no `feat:` or `fix:` commits have been pushed since the last tag (there is no tag yet), semantic-release will attempt a first release

Note: On first run with no existing git tag, semantic-release will use the current `version` in `package.json` as the base and publish `0.1.0` to npm if it hasn't been published yet, or determine the next version from commits.

- [ ] **Step 3: Confirm npm publish**

```bash
npm view just-dot-qr
```

Expected: package info including `"version": "0.1.0"` (or whatever version was released)

- [ ] **Step 4: Confirm GitHub Release**

Go to your GitHub repo → **Releases**. A release tagged `v0.1.0` (or similar) should exist with a generated changelog.
