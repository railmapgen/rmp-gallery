# RMP Gallery

Browse, set, and submit your RMP template here!

## How to submit your project

1. Open [RMP Gallery / new](https://railmapgen.github.io/rmp-gallery/#/new).
2. Select your project JSON save.
3. Enter the link where you get the valid data in _Reference link_.
  Do not use data without valid source such as Baidu Baike. Link from official website is preferred.
4. Enter the reason why you make these changes in _Justification_.
  Possible reasons may be Add new city, update obsolete data, etc.
5. Enter the city name.
  You may add as many translations as you like, but English name must be added before submit.
6. Enter some additional description if you like.
  English also must be added before submit.
7. Click _Submit_.
8. Click _Copy issue body and open a new issue_.
9. Paste the auto-copied context in issue body.
10. Click _Submit new issue_.
11. Wait check, approval, and merge from administrators. (No action required.)

## Development - Optimizing Storage & Reclaiming Space

This repository contains numerous large image assets (>10 MB). While some files are eventually
deleted from the project, they remain in the Git history, causing the .git directory to expand
significantly over time.

To save disk space, we recommend using a Shallow Clone approach. Follow these steps whenever
you need to synchronize with the latest code while purging old historical data from your local
machine.

Run the following commands to reset your local environment to the latest remote state and prune
unneeded historical blobs:

```bash
# 1. Fetch only the latest snapshot from the remote (shallow fetch)
git fetch --depth 1 origin main

# 2. Forcefully reset the local branch to match the remote state (discards local changes and history)
git reset --hard origin/main

# 3. Remove all untracked files and directories from the working tree
git clean -df

# 4. Permanently prune unreachable objects and recompress the database to minimize disk usage
git -c gc.reflogExpire=now gc --prune=now --aggressive
```

> [!CAUTION]
> Warning: These steps are destructive. Ensure you have committed or backed up any local changes
> before running them, as reset --hard and clean -df will permanently discard uncommitted work.
