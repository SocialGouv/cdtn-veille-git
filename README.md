# veille-git

API + UI pour reporter les changements de contenus sur des repos GIT.

## Dev

Utiliser [clone.sh](./clone.sh) pour récupérer les repos dans `/tmp/clones`.

```
yarn
yarn dev
```

Actuellement les repos GIT sont récupérés via le `Dockerfile`, donc mis à jour à chaque déploiement.

# Todo :

- continuous deployment with @renovate + @socialgouv
- remplacer simple-git par un binding natif
- maybe some persistent redis/memcache
