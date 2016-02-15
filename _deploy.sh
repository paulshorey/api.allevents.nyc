#!/bin/bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/ps1-git
git pull
npm install
pm2 restart all