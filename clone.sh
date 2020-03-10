#!/bin/sh

GIT_STORAGE=/tmp/clones

mkdir -p $GIT_STORAGE || true

git clone https://github.com/SocialGouv/legi-data $GIT_STORAGE/socialgouv/legi-data
git clone https://github.com/SocialGouv/kali-data $GIT_STORAGE/socialgouv/kali-data
git clone https://github.com/SocialGouv/fiches-vdd $GIT_STORAGE/socialgouv/fiches-vdd
