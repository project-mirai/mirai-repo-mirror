#!/usr/bin/env bash

git branch

git config --local user.name "RepoSync"
git config --local user.email "RepoSync@localhost"
git config --local pull.rebase "false"

chmod 400 ./.script/id_rsa
git config --local core.sshCommand "ssh -i ./.script/id_rsa -F /dev/null -v"

git log --all | head

ssh -i ./.script/id_rsa -T git@gitee.com
ssh -i ./.script/id_rsa -T git@github.com

source=$1
target=$2

echo Syncing repos...

git fetch --all


git pull "$source" master
git pull "$target" master

git pull "$source" master
git pull "$target" master

echo Updating repos...

git push "$source" master
git push "$target" master

echo Re Updating repos...

git fetch
git merge

git fetch --unshallow "$source"
git fetch --unshallow "$target"
git merge

git pull "$source" master
git pull "$target" master

git push "$source" master
git push "$target" master

git config --local --unset core.sshCommand
git config --local --unset user.name
git config --local --unset user.email
git config --local --unset pull.rebase
