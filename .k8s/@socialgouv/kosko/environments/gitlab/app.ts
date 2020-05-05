export type AppComponentEnvironment = {
  containerPort: number,
  imageName: string;
  imageTag: string;
  servicePort: number,
  subdomain?: string;
}
