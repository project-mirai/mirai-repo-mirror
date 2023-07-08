#!/usr/bin/env sh

git fetch origin pull/$PR_NUM/head:THE_PR_PR0
echo $BASE_SHA

CURRENT_B=$(git branch --show-current)
echo $CURRENT_B

git branch THE_BASE "$CURRENT_B"
git branch THE_PR THE_PR_PR0
git fetch --unshallow

echo "============"
git branch
echo "============"

echo "W1:"
git merge-base $BASE_SHA THE_PR
echo "W5:"
git merge-base THE_BASE THE_PR
echo "Wawe:"
git merge-base -a THE_BASE THE_PR
echo "Wjaiopdja:"
git merge-base --octopus THE_BASE THE_PR
echo "aeriawef:"
git merge-base -a --octopus THE_BASE THE_PR
echo "END"

#FORK_POINT=$(git merge-base --octopus THE_BASE THE_PR)
## TODO: git merge-base 上面几条命令都没有输出. 待有缘人修复
FORK_POINT="THE_BASE"
echo $FORK_POINT

git rev-list --count "$FORK_POINT..THE_PR" > tmp/count
cat tmp/count
git --no-pager diff "$FORK_POINT..THE_PR" --no-color --output tmp/change-diff
git --no-pager diff "$FORK_POINT..THE_PR" --name-only --output tmp/name-changed

# Prepare fork repo

cd tmp
git clone .. fork
cd fork

git checkout -f THE_PR

echo "-- THE FORK --"

pwd
git branch

