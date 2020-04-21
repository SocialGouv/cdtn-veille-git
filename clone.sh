#!/bin/sh

GIT_STORAGE=/tmp/clones

mkdir -p $GIT_STORAGE || true

git clone https://github.com/SocialGouv/legi-data $GIT_STORAGE/socialgouv/legi-data || (cd $GIT_STORAGE/socialgouv/legi-data && git pull)
cd $GIT_STORAGE/socialgouv/legi-data && echo "legi-data : `git log --pretty=format:'%H' -n 1`"
git clone https://github.com/SocialGouv/kali-data $GIT_STORAGE/socialgouv/kali-data || (cd $GIT_STORAGE/socialgouv/kali-data && git pull)
cd $GIT_STORAGE/socialgouv/kali-data && echo "kali-data : `git log --pretty=format:'%H' -n 1`"
git clone https://github.com/SocialGouv/fiches-vdd $GIT_STORAGE/socialgouv/fiches-vdd || (cd $GIT_STORAGE/socialgouv/fiches-vdd && git pull)
cd $GIT_STORAGE/socialgouv/fiches-vdd && echo "fiches-vdd : `git log --pretty=format:'%H' -n 1`"