//

import { GlobalEnvironment } from "../types";

const env: GlobalEnvironment = {
  namespaceName: "cdtn-veille-git",
  domain: process.env.KUBE_INGRESS_BASE_DOMAIN || "fabrique.social.gouv.fr",
  subdomain: "cdtn",
};

export default env;
