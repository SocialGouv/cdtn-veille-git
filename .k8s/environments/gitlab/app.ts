import { default as gitlabAppConfig } from "@socialgouv/kosko/environments/gitlab/app";
import { AppComponentEnvironment } from "@socialgouv/kosko/types";

const env: AppComponentEnvironment = {
  ...gitlabAppConfig,
  name: "veille",
  labels: {
    component: "next-app",
  },
  requests: {
    cpu: "5m",
    memory: "32Mi",
  },
  limits: {
    cpu: "50m",
    memory: "64Mi",
  },
  containerPort: 3000,
  servicePort: 3000,
};

export default env;
