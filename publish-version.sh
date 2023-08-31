#!/bin/bash

read -p "Enter version: " version

git checkout -b fix/$version

pnpm changeset:version

# Run changeset works only with patch but that's ok for bumping version
(
  echo "patch"
  sleep 1
  echo "$version"
  sleep 1
  echo ""
  sleep 1
  echo "Y"
) | npx changeset

git add .

git commit -m "Bump version to $version"

pnpm build

pnpm changeset:publish

git push --set-upstream origin fix/$version --follow-tags