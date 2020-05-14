# Deployment K8S

## TL;DR

```sh
# Get dev project secret from k8s
$ 

# Deploy metabase from your computer
$ yarn --silent --cwd .k8s kosko generate --env local | kubectl apply -f -
# List latest deployment
$ kubectl -n covid-data-localhost-${USER} get deployments,po,job,svc,sts,secret,cert,ingress
# Wait for metabase to be ready
$ kubectl -n covid-data-localhost-${USER} wait --for=condition=available deployment.extensions/metabase

#

# Remove your deployment
$ yarn --silent --cwd .k8s kosko generate --env local | kubectl delete -f -
```

## General

> This documentation will be extracted in the future

### Production

```yaml
Deploy (prod):
  environment:
    name: prod
  script:
    - yarn --silent --cwd .k8s
      kosko generate --env prod | kubectl apply -f -
```

### Dev

```yaml
Deploy (dev):
  environment:
    name: ${CI_COMMIT_REF_NAME}-dev
  script:
    - yarn --cwd .k8s --silent
      kosko generate --env dev | kubectl apply -f -
```

To test it locally you should create a `./environments/dev/.env` file with GitLab like environnement variables and run it through `dotenv`.

```sh
$ DOTENV_CONFIG_PATH=./environments/dev/.env yarn --silent --cwd .k8s kosko generate --require dotenv/config --env dev | kubectl apply -f -
# [...]
```

### Local

```sh
# To apply your local config run
# Note that it will use your env `$USER` or `$USERNAME` as namespace
# As example, for the user `x` the namespace will be `covid-data-localhost-x`
$ yarn --silent --cwd .k8s kosko generate --env local | kubectl apply -f -
namespace/covid-data-localhost-x created
# [...]

# You can test the deploy code using kubectl commands
$ kubectl -n covid-data-localhost-x get deployments,po,job,svc,sts,secret,cert,ingress

# To remove your temporary deployed code.
$ yarn --silent --cwd .k8s kosko generate --env local | kubectl delete -f -
```

