# cdtn-veille-git

API + UI pour reporter les changements de contenus sur des repos GIT.

## API

| endpoint                                | usage                         |
| --------------------------------------- | ----------------------------- |
| `/api/git/[owner]/[repo]/history`       | fetch latest commits          |
| `/api/git/[owner]/[repo]/commit/[hash]` | fetch detailed commit changes |

## Dev

Utiliser [clone.sh](./clone.sh) pour récupérer les repos dans `/tmp/clones`.

```
yarn
yarn dev
```

Actuellement les repos GIT sont récupérés via le `Dockerfile`, donc mis à jour à chaque déploiement.

## Repos

- [legi-data](https://github.com/SocialGouv/legi-data)
- [kali-data](https://github.com/SocialGouv/kali-data)
- [fiches-vdd](https://github.com/SocialGouv/fiches-vdd)

# Todo :

- continuous deployment with @renovate + @socialgouv
- remplacer simple-git par un binding natif
- maybe some persistent redis/memcache
- 
