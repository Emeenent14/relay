# How to Release Relay

This guide explains how to build and release a new version of Relay using GitHub Actions.

## Prerequisites
- A GitHub repository hosting this code.
- GitHub Actions enabled in the repository settings.

## Configuration
Before releasing, ensure your configuration is correct.

1.  **App Identifier**: Check `src-tauri/tauri.conf.json`.
    ```json
    "identifier": "com.relay.app"
    ```
    Change this to a unique identifier for your organization (e.g., `com.yourname.relay`) to avoid conflict with other apps.

2.  **Version**: Ensure the version matches in **both**:
    - `package.json` (`"version": "0.1.0"`)
    - `src-tauri/tauri.conf.json` (`"version": "0.1.0"`)

## Creating a Release

The release process is automated via GitHub Actions.

1.  **Update Version**: Increment the version numbers in `package.json` and `src-tauri/tauri.conf.json`.
2.  **Commit**: Commit these changes.
    ```bash
    git add .
    git commit -m "chore: bump version to 0.1.0"
    ```
3.  **Tag**: Create a git tag starting with `v` followed by the version number.
    ```bash
    git tag v0.1.0
    git push origin v0.1.0
    ```
    *Note: The tag must match the format `v*` triggers the workflow.*

## What Happens Next?
1.  The GitHub Action defined in `.github/workflows/release.yml` will trigger.
2.  It will:
    - Build the Gateway (`npm run build:gateway`).
    - Build the Tauri Release (`npm run tauri:build` logic via tauri-action).
    - Create a **Draft Release** (or published release depending on config) on GitHub.
    - Upload the Windows installer (`.msi` / `.exe`) as assets.

## Troubleshooting
- **Build Fails**: Check the GitHub Actions logs. Common issues include missing dependencies or script errors.
- **Assets Missing**: Ensure the build completed successfully.
