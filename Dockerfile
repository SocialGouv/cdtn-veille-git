FROM node:13-alpine

RUN apk add --update --no-cache git=~2

WORKDIR /app

COPY package.json yarn.lock /app/
COPY packages/frontend/package.json /app/packages/frontend/package.json
COPY packages/git/package.json /app/packages/git/package.json

RUN yarn

COPY packages /app/packages
COPY .submodules /app/.submodules

RUN yarn prerender

ENTRYPOINT ["yarn", "workspace", "@veille/frontend", "start"]

