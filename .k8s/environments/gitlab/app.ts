import { default as config } from "@socialgouv/kosko/environments/gitlab/app";
import { AppComponentEnvironment } from "@socialgouv/kosko/types";

const env: AppComponentEnvironment = {
  ...config,
  name: "veille",
  containerPort: 3000,
  servicePort: 3000,
};

export default env;
