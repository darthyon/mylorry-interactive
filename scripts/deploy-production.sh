#!/usr/bin/env bash

set -euo pipefail

branch="$(git branch --show-current)"

if [[ "$branch" != "main" ]]; then
  echo "Refusing to deploy: current branch is '$branch'. Switch to 'main' first."
  exit 1
fi

if [[ -n "$(git status --short)" ]]; then
  echo "Refusing to deploy: working tree is not clean."
  exit 1
fi

git fetch origin main

local_main="$(git rev-parse main)"
remote_main="$(git rev-parse origin/main)"

if [[ "$local_main" != "$remote_main" ]]; then
  echo "Refusing to deploy: local 'main' is not aligned with 'origin/main'. Pull or reconcile first."
  exit 1
fi

npm run build
git push origin main
vercel deploy --prod
