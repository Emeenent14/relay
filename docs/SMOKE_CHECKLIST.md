# Relay Desktop Smoke Checklist

Run this checklist before tagging a release.

## Core Server Flows

- [ ] Add server: create a server with command + args + env and confirm it appears in My Servers.
- [ ] Edit server: update name/description/env and confirm changes persist after app restart.
- [ ] Enable/disable server: toggle ON/OFF and verify status changes (`running`/`stopped`).
- [ ] Delete server: remove a server and confirm it no longer appears after refresh/restart.
- [ ] Export config: export to Claude/Cursor (or custom path) and verify `Relay Gateway` entry is written.

## Diagnostics

- [ ] `Test Connection` succeeds for a known-good server.
- [ ] `Test Connection` fails with actionable hints for an invalid command.
- [ ] Dependency check warns when required runtime is missing (for example `docker`).

## Logs and Inspector

- [ ] Logs dialog opens from server row/details and receives streaming output.
- [ ] Stream filter/search/line-limit controls in logs dialog work.
- [ ] Inspector tool listing and tool invocation complete without runtime errors.
