#!/bin/sh

GIT_STORAGE=/tmp/clones

mkdir -p $GIT_STORAGE || true

git clone https://github.com/SocialGouv/legi-data $GIT_STORAGE/socialgouv/legi-data || (cd $GIT_STORAGE/socialgouv/legi-data && git pull)
git clone https://github.com/SocialGouv/kali-data $GIT_STORAGE/socialgouv/kali-data || (cd $GIT_STORAGE/socialgouv/kali-data && git pull)
git clone https://github.com/SocialGouv/fiches-vdd $GIT_STORAGE/socialgouv/fiches-vdd || (cd $GIT_STORAGE/socialgouv/fiches-vdd && git pull)
