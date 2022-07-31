#!/usr/bin/env sh

git fetch origin pull/$PR_NUM/head:THE_PR
echo $BASE_SHA
git branch

CURRENT_B=$(git branch --show-current)
echo $CURRENT_B

git merge-base --fork-point "$CURRENT_B" THE_PR
FORK_POINT=$(git merge-base --fork-point "$CURRENT_B" THE_PR)
echo $FORK_POINT

git rev-list --count "$FORK_POINT..THE_PR" > tmp/count
cat tmp/count
git --no-pager diff "$FORK_POINT..THE_PR" --no-color --output tmp/change-diff
git --no-pager diff "$FORK_POINT..THE_PR" --name-only --output tmp/name-changed
