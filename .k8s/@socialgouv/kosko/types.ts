//


export interface GlobalEnvironment {
  annotations?: Record<string, string>;
  domain: string;
  labels?: Record<string, string>;
  namespaceName: string;
  subdomain: string;
  subdomainSeparator: string;
}

export type AppComponentEnvironment = {
  containerPort: number,
  imageName: string;
  imageTag: string;
  name?: string,
  servicePort: number,
  subdomain?: string;
}

export type NamespaceComponentEnvironment = {
  annotations?: Record<string, string>;
  enabled: boolean;
  labels?: Record<string, string>;
}
