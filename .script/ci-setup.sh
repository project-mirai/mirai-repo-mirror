#!/usr/bin/env sh

git fetch origin pull/$PR_NUM/head:THE_PR_PR0
echo $BASE_SHA
git branch

CURRENT_B=$(git branch --show-current)
echo $CURRENT_B

git branch $BASE_SHA THE_BASE
git branch THE_PR THE_PR_PR0

echo "W1:"
git merge-base $BASE_SHA THE_PR
echo "W5:"
git merge-base THE_BASE THE_PR
echo "W6:"
git merge-base --fork-point THE_BASE THE_PR
echo "W2:"
git merge-base --fork-point "$CURRENT_B" THE_PR
echo "END"

FORK_POINT=$(git merge-base --fork-point "$CURRENT_B" THE_PR)
echo $FORK_POINT

git rev-list --count "$FORK_POINT..THE_PR" > tmp/count
cat tmp/count
git --no-pager diff "$FORK_POINT..THE_PR" --no-color --output tmp/change-diff
git --no-pager diff "$FORK_POINT..THE_PR" --name-only --output tmp/name-changed
