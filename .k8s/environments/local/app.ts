import { AppComponentEnvironment } from "@socialgouv/kosko/types";

const env: AppComponentEnvironment = {
  name: "veille",
  imageName:
    "registry.gitlab.factory.social.gouv.fr/socialgouv/cdtn-veille-git",
  imageTag: "fe2edf06bd1b97fa5977e1ace19833fe306e1cd9",
  labels: {
    component: "next-app",
  },
  containerPort: 3000,
  servicePort: 3000,
};

export default env;
