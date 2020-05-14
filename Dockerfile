FROM node:13-alpine

RUN apk add git

WORKDIR /app

COPY clone.sh .

# renovate: datasource=git-refs depName=socialgouv/legi-data
ARG LEGI_DATA_VERSION=1c4dbc6d9ebcb6481cf7f97c7d4535befbd26861

# renovate: datasource=git-refs depName=socialgouv/kali-data
ARG KALI_DATA_VERSION=557ce6d41cf86af1543b65d177fc57fc2a6a5821

# renovate: datasource=git-refs depName=socialgouv/fiches-vdd
ARG FICHES_VDD_VERSION=cad3f439d726d735e1579f065f59121582190628

RUN ./clone.sh

COPY package.json .
COPY yarn.lock .
COPY packages/frontend/package.json ./packages/frontend/package.json
COPY packages/git/package.json ./packages/git/package.json

RUN yarn

COPY packages ./packages

RUN yarn prerender

ENTRYPOINT ["yarn", "workspace", "@veille/frontend", "start"]

