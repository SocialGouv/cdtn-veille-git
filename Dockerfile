FROM node:13-alpine

RUN apk add --update --no-cache git=~2

WORKDIR /app

# renovate: datasource=git-refs depName=socialgouv/legi-data
ARG LEGI_DATA_VERSION=1c4dbc6d9ebcb6481cf7f97c7d4535befbd26861

# renovate: datasource=git-refs depName=socialgouv/kali-data
ARG KALI_DATA_VERSION=557ce6d41cf86af1543b65d177fc57fc2a6a5821

# renovate: datasource=git-refs depName=socialgouv/fiches-vdd
ARG FICHES_VDD_VERSION=cad3f439d726d735e1579f065f59121582190628

RUN set -ex \
  #
  && GIT_STORAGE=/tmp/clones \
  && mkdir -p $GIT_STORAGE || true \
  #
  && git clone https://github.com/SocialGouv/legi-data $GIT_STORAGE/socialgouv/legi-data \
  && cd $GIT_STORAGE/socialgouv/legi-data  \
  && echo "legi-data : `git log --pretty=format:'%H' -n 1`" \
  #
  && git clone https://github.com/SocialGouv/kali-data $GIT_STORAGE/socialgouv/kali-data \
  && cd $GIT_STORAGE/socialgouv/kali-data \
  && echo "kali-data : `git log --pretty=format:'%H' -n 1`" \
  #
  && git clone https://github.com/SocialGouv/fiches-vdd $GIT_STORAGE/socialgouv/fiches-vdd \
  && cd $GIT_STORAGE/socialgouv/fiches-vdd  \
  && echo "fiches-vdd : `git log --pretty=format:'%H' -n 1`" \
  ;

COPY package.json yarn.lock /app/
COPY packages/frontend/package.json /app/packages/frontend/package.json
COPY packages/git/package.json /app/packages/git/package.json

RUN yarn

COPY packages ./packages

RUN yarn prerender

ENTRYPOINT ["yarn", "workspace", "@veille/frontend", "start"]

