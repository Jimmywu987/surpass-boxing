import getConfig from "next/config";
type Config = {
  env: {
    REACT_APP_GOOGLE_ID: string;
    REACT_APP_GOOGLE_SECRET: string;
    JWT_SECRET: string;
  };
};
const { serverRuntimeConfig } = getConfig() ?? {};
export const getServerConfig = (): Config => serverRuntimeConfig;
