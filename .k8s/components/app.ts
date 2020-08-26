import env from "@kosko/env";

import { create } from "@socialgouv/kosko-charts/components/app";

const manifests = create("app", {
  env,
  config: { containerPort: 3000 },
  deployment: {
    container: {
      livenessProbe: {
        periodSeconds: 20,
      },
      readinessProbe: {
        periodSeconds: 20,
      },
      resources: {
        requests: {
          cpu: "100m",
          memory: "1024Mi",
        },
        limits: {
          cpu: "1000m",
          memory: "2048Mi",
        },
      },
    },
  },
});

export default manifests;
