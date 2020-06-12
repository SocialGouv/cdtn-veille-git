FROM node:13-alpine

RUN apk add git

WORKDIR /app

COPY clone.sh .

RUN ./clone.sh

COPY package.json .
COPY yarn.lock .
COPY packages/frontend/package.json ./packages/frontend/package.json
COPY packages/git/package.json ./packages/git/package.json

RUN yarn

COPY packages ./packages

RUN yarn prerender

ENTRYPOINT ["yarn", "workspace", "@veille/frontend", "start"]

