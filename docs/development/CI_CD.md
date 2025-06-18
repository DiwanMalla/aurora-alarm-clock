# CI/CD Pipeline Documentation

## Overview

The Aurora Clock app uses GitHub Actions for continuous integration and deployment. This document outlines the complete CI/CD pipeline setup.

## Workflows

### 1. Continuous Integration (`ci.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

- **Test & Lint**: Runs on multiple Node.js versions (18.x, 20.x)
  - TypeScript type checking
  - ESLint code linting
  - Prettier formatting check
  - Jest tests with coverage
  - Coverage upload to Codecov
- **Security Audit**:
  - npm security audit
  - Check for outdated packages

### 2. Build & Release (`build.yml`)

**Triggers:**

- Git tags starting with `v` (e.g., `v1.0.0`)
- Manual workflow dispatch with platform selection

**Jobs:**

- **Build Android**: Creates APK builds
- **Build iOS**: Creates IPA builds (macOS runner)
- **Release**: Creates GitHub release with artifacts

### 3. Expo Preview (`preview.yml`)

**Triggers:**

- Pull requests to `main` or `develop` branches

**Features:**

- Creates Expo preview builds for testing
- Posts preview links in PR comments
- Can be skipped with `skip-preview` label

## Setup Requirements

### 1. Repository Secrets

Add these secrets in your GitHub repository settings:

```
EXPO_TOKEN=your_expo_access_token
EXPO_USERNAME=your_expo_username
CODECOV_TOKEN=your_codecov_token (optional)
```

### 2. Expo Account Setup

1. Create an Expo account at [expo.dev](https://expo.dev)
2. Generate an access token in your Expo dashboard
3. Add the token as `EXPO_TOKEN` in GitHub secrets

### 3. Codecov Setup (Optional)

1. Sign up at [codecov.io](https://codecov.io)
2. Connect your GitHub repository
3. Add the provided token as `CODECOV_TOKEN`

## Branch Protection

Recommended branch protection rules for `main`:

- Require status checks to pass before merging
- Require branches to be up to date before merging
- Require review from code owners
- Restrict pushes to matching branches

## Dependency Management

**Dependabot** is configured to:

- Check for npm dependency updates weekly
- Check for GitHub Actions updates weekly
- Group related dependencies (Expo, React, testing, linting)
- Auto-assign PRs to maintainers

## Release Process

### Automatic Releases

1. Create and push a git tag:

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. GitHub Actions will:
   - Run all tests
   - Build Android APK and iOS IPA
   - Create a GitHub release with artifacts

### Manual Builds

1. Go to Actions tab in GitHub
2. Select "Build & Release" workflow
3. Click "Run workflow"
4. Choose platform (android/ios/all)

## Monitoring

### Build Status

- Check the Actions tab for build status
- Failed builds will show detailed logs
- Email notifications for failed builds (configurable)

### Coverage Reports

- Coverage reports are uploaded to Codecov
- View detailed coverage at `https://codecov.io/gh/yourusername/clock`

## Troubleshooting

### Common Issues

1. **Expo build fails**

   - Check EXPO_TOKEN is valid
   - Ensure Expo CLI is latest version
   - Verify app.json configuration

2. **Tests fail in CI but pass locally**

   - Check Node.js version differences
   - Verify all dependencies in package.json
   - Check for environment-specific code

3. **iOS build fails**
   - Ensure provisioning profiles are set up
   - Check Xcode version compatibility
   - Verify iOS deployment target

### Debug Commands

```bash
# Local testing equivalent to CI
npm run test:ci
npm run lint
npm run type-check
npm run format:check

# Build locally with Expo
expo build:android --type apk
expo build:ios --type archive
```

## Performance

### Build Times

- **CI Tests**: ~3-5 minutes
- **Android Build**: ~10-15 minutes
- **iOS Build**: ~15-25 minutes
- **Preview Build**: ~5-8 minutes

### Optimization Tips

- Use `npm ci` instead of `npm install` for faster installs
- Cache node_modules between runs
- Run tests in parallel where possible
- Use matrix builds for multiple Node.js versions

## Security

### Best Practices

- Never commit secrets to the repository
- Use GitHub secrets for sensitive data
- Regularly update dependencies with Dependabot
- Run security audits in CI pipeline
- Use signed commits for releases

### Access Control

- Limit who can trigger manual workflows
- Require reviews for dependency updates
- Use branch protection rules
- Monitor workflow logs for suspicious activity
