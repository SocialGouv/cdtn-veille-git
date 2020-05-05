export type AppComponentEnvironment = {
  containerPort: number,
  imageName: string;
  imageTag: string;
  name?: string,
  servicePort: number,
  subdomain?: string;
}
