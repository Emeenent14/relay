@echo off
REM Temporarily remove Git's link.exe from PATH to avoid conflict with MSVC linker
set "PATH=%PATH:C:\Program Files\Git\usr\bin;=%"
npm run tauri:dev
