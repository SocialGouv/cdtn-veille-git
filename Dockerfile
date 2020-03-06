FROM node:12-alpine

RUN apk add git

RUN mkdir -p /tmp/clones/socialgouv

RUN git clone https://github.com/SocialGouv/legi-data /tmp/clones/socialgouv/legi-data
RUN git clone https://github.com/SocialGouv/kali-data /tmp/clones/socialgouv/kali-data

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY packages/frontend/package.json ./packages/frontend/package.json
COPY packages/git/package.json ./packages/git/package.json

RUN yarn

COPY packages ./packages

RUN yarn workspace @veille/frontend build


ENTRYPOINT ["yarn", "workspace", "@veille/frontend", "start"]

