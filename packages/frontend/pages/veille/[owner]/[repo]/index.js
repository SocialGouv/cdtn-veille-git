import Page, { getStaticProps } from "./commit/[hash].js";
import repos from "../../../../src/repos";

// reuse commit getStaticProps
export { getStaticProps };

export const getStaticPaths = async () => {
  const paths = Object.keys(repos).map(key => {
    const [owner, repo] = key.split("/");
    return {
      params: { owner, repo, hash: null }
    };
  });
  return {
    paths,
    fallback: true
  };
};

export default Page;
