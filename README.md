# cdtn-veille-git

API + UI pour reporter les changements de contenus sur des repos GIT.

## API

| endpoint                                | usage                         |
| --------------------------------------- | ----------------------------- |
| `/api/git/[owner]/[repo]/history`       | fetch latest commits          |
| `/api/git/[owner]/[repo]/commit/[hash]` | fetch detailed commit changes |

## Dev

Ensure that you have the data submodules (in .submodules)

```
yarn
yarn dev
```

Actuellement les repos GIT sont récupérés via le `Dockerfile`, donc mis à jour à chaque déploiement.

## Repos

- [legi-data](https://github.com/SocialGouv/legi-data)
- [kali-data](https://github.com/SocialGouv/kali-data)
- [fiches-vdd](https://github.com/SocialGouv/fiches-vdd)

Add a data submodule with 
```
$ git submodule add --depth 1 --name <repo> https://github.com/<user>/<repo> ./.submodules/<user>/<repo>

# Example
$ git submodule add --depth 1 --name socialgouv/legi-data https://github.com/socialgouv/legi-data ./.submodules/socialgouv/legi-data
$ git submodule add --depth 1 --name socialgouv/kali-data https://github.com/socialgouv/kali-data ./.submodules/socialgouv/kali-data
$ git submodule add --depth 1 --name socialgouv/fiches-vdd https://github.com/socialgouv/fiches-vdd ./.submodules/socialgouv/fiches-vdd
``` 
# Todo :

- continuous deployment with @renovate + @socialgouv
- remplacer simple-git par un binding natif
- maybe some persistent redis/memcache
