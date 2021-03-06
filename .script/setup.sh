#!/usr/bin/env bash

mkdir ~/.ssh
ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts
ssh-keyscan -t rsa gitee.com >> ~/.ssh/known_hosts

git remote add "$1" git@github.com:project-mirai/mirai-repo-mirror.git
git remote add "$2" git@gitee.com:peratx/mirai-repo.git

chmod 400 ./.script/id_rsa
git config --local core.sshCommand "ssh -i ./.script/id_rsa -F /dev/null -v"

