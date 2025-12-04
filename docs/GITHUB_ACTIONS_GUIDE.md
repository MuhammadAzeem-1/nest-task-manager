# GitHub Actions CI/CD Guide

This guide explains how to create and configure GitHub Actions YAML files for CI/CD pipelines in your NestJS project.

## Table of Contents

1. [Introduction](#introduction)
2. [GitHub Actions Basics](#github-actions-basics)
3. [Creating Your First Workflow](#creating-your-first-workflow)
4. [Workflow Structure](#workflow-structure)
5. [Common Jobs and Steps](#common-jobs-and-steps)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Introduction

GitHub Actions is a CI/CD platform that allows you to automate your build, test, and deployment pipeline. Workflows are defined using YAML files stored in the `.github/workflows/` directory.

## GitHub Actions Basics

### Key Concepts

- **Workflow**: An automated procedure defined in a YAML file
- **Job**: A set of steps that run on the same runner
- **Step**: An individual task that can run commands or use actions
- **Action**: A reusable unit of code that performs a specific task
- **Runner**: A server that runs your workflows (GitHub-hosted or self-hosted)

### File Location

All workflow files must be placed in:
```
.github/workflows/
```

Files should have the `.yml` or `.yaml` extension.

## Creating Your First Workflow

### Step 1: Create the Directory Structure

```bash
mkdir -p .github/workflows
```

### Step 2: Create a YAML File

Create a new file, for example: `.github/workflows/ci.yml`

### Step 3: Define the Workflow

Every workflow file must start with:

```yaml
name: Your Workflow Name

on:
  # Define when the workflow should run
```

## Workflow Structure

### Basic Template

```yaml
name: CI Pipeline

# When to trigger the workflow
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

# Jobs to run
jobs:
  job-name:
    runs-on: ubuntu-latest
    steps:
      - name: Step name
        run: echo "Hello World"
```

### Trigger Events

Common trigger events:

```yaml
on:
  # On push to specific branches
  push:
    branches: [ main, develop ]
  
  # On pull requests
  pull_request:
    branches: [ main ]
  
  # On schedule (cron)
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  
  # Manual trigger
  workflow_dispatch:
  
  # Multiple events
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  release:
    types: [ published ]
```

## Common Jobs and Steps

### 1. Checkout Code

Always start by checking out your repository:

```yaml
- name: Checkout code
  uses: actions/checkout@v4
```

### 2. Setup Node.js

For Node.js projects:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # Caches node_modules for faster builds
```

### 3. Install Dependencies

```yaml
- name: Install dependencies
  run: npm ci  # Use npm ci for CI environments (faster, more reliable)
```

### 4. Linting

```yaml
- name: Run ESLint
  run: npm run lint

- name: Check Prettier formatting
  run: npx prettier --check "src/**/*.ts" "test/**/*.ts"
```

### 5. Unit Tests

```yaml
- name: Run unit tests
  run: npm run test

- name: Run tests with coverage
  run: npm run test:cov
```

### 6. Integration/E2E Tests

For tests requiring a database:

```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: test_db
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
    ports:
      - 5432:5432

env:
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

steps:
  - name: Generate Prisma Client
    run: npx prisma generate
  
  - name: Run database migrations
    run: npx prisma db push --skip-generate
  
  - name: Run E2E tests
    run: npm run test:e2e
```

### 7. Build Application

```yaml
- name: Build application
  run: npm run build

- name: Upload build artifacts
  uses: actions/upload-artifact@v4
  with:
    name: dist
    path: dist/
    retention-days: 7
```

### 8. Using Secrets

For sensitive data (API keys, tokens, etc.):

1. Add secrets in GitHub: Settings → Secrets and variables → Actions
2. Use in workflow:

```yaml
- name: Use secret
  run: echo ${{ secrets.MY_SECRET }}
  env:
    API_KEY: ${{ secrets.API_KEY }}
```

## Complete Example

Here's a complete CI workflow example:

```yaml
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint:
    name: Lint and Code Quality
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Check formatting
        run: npx prettier --check "src/**/*.ts" "test/**/*.ts"

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Generate coverage
        run: npm run test:cov

  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [lint, test]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
```

## Best Practices

### 1. Use Job Dependencies

Control job execution order:

```yaml
jobs:
  lint:
    # ... steps
  
  test:
    needs: lint  # Only run after lint succeeds
    # ... steps
  
  build:
    needs: [lint, test]  # Run after both lint and test succeed
    # ... steps
```

### 2. Cache Dependencies

Speed up builds by caching:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # Automatically caches node_modules
```

### 3. Use Matrix Strategy

Test against multiple Node.js versions:

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

### 4. Fail Fast

Stop on first error:

```yaml
- name: Run tests
  run: npm run test
  continue-on-error: false  # Default, but explicit is better
```

### 5. Use Environment Variables

```yaml
env:
  NODE_ENV: test
  DATABASE_URL: postgresql://user:pass@localhost:5432/db

steps:
  - name: Run tests
    run: npm run test
    env:
      CUSTOM_VAR: value
```

### 6. Conditional Steps

Run steps conditionally:

```yaml
- name: Deploy to production
  if: github.ref == 'refs/heads/main'
  run: npm run deploy
```

### 7. Artifacts and Reports

Save build outputs:

```yaml
- name: Upload coverage
  uses: actions/upload-artifact@v4
  with:
    name: coverage-report
    path: coverage/
    retention-days: 30
```

## Troubleshooting

### Common Issues

1. **Workflow not triggering**
   - Check file location: `.github/workflows/`
   - Verify YAML syntax (use a YAML validator)
   - Check branch names in `on:` section

2. **Dependencies not installing**
   - Ensure `package.json` and `package-lock.json` are committed
   - Use `npm ci` instead of `npm install` for CI

3. **Tests failing**
   - Check environment variables
   - Verify database/service connections
   - Review test logs in Actions tab

4. **Build failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in `package.json`
   - Review TypeScript compilation errors

5. **Slow builds**
   - Enable caching (Node.js, dependencies)
   - Use `npm ci` instead of `npm install`
   - Consider parallelizing jobs

### Debugging Tips

1. **Add debug output:**
   ```yaml
   - name: Debug info
     run: |
       echo "Node version: $(node --version)"
       echo "NPM version: $(npm --version)"
       echo "Working directory: $(pwd)"
   ```

2. **Check workflow logs:**
   - Go to Actions tab in GitHub
   - Click on the failed workflow
   - Expand failed step to see logs

3. **Test locally:**
   - Use `act` tool to run GitHub Actions locally
   - Or manually run commands from workflow steps

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [YAML Syntax Guide](https://docs.ansible.com/ansible/latest/reference_appendices/YAMLSyntax.html)
- [Node.js Setup Action](https://github.com/actions/setup-node)

## Example: Multi-Stage Pipeline

```yaml
name: Full CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  # Stage 1: Code Quality
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npx prettier --check "src/**/*.ts"

  # Stage 2: Testing
  test:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test
      - run: npm run test:cov

  # Stage 3: Build
  build:
    runs-on: ubuntu-latest
    needs: [quality, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  # Stage 4: Deploy (example)
  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: dist
      - name: Deploy
        run: echo "Deploy to production"
        # Add your deployment commands here
```

## Summary

Creating GitHub Actions workflows involves:

1. **Creating** `.github/workflows/*.yml` files
2. **Defining** when workflows trigger (`on:`)
3. **Setting up** jobs with steps
4. **Using** actions from the marketplace
5. **Configuring** environment variables and secrets
6. **Testing** and iterating on your workflows

Remember to:
- Keep workflows focused and modular
- Use caching to speed up builds
- Handle errors gracefully
- Document complex workflows
- Test workflows in pull requests before merging

Happy automating! 🚀

