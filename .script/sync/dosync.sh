#!/usr/bin/env bash

## Setup SSH Key

mkdir ~/.ssh

ID_FILE='./private/id_rsa'
TEMP_SFTP_FILE='sftp_cmd'

ssh-keyscan "$MIRAI_REPO_SERVER" >> ~/.ssh/known_hosts
ssh-keyscan "$MIRAI_FORUM_SERVER" >> ~/.ssh/known_hosts

chmod 400 $ID_FILE

git config --local core.sshCommand "ssh -i ./private/id_rsa -F /dev/null -v"

## Sync to mirai repo

printf "%s" "put -r repo/* $MIRAI_REPO_PATH" >$TEMP_SFTP_FILE
sftp -b $TEMP_SFTP_FILE -i $ID_FILE "mclsync@$MIRAI_REPO_SERVER"

## Sync to mirai forum

printf "%s" "put -r repo/* $MIRAI_FORUM_PATH" >$TEMP_SFTP_FILE
sftp -b $TEMP_SFTP_FILE -i $ID_FILE "mclsync@$MIRAI_FORUM_SERVER"
