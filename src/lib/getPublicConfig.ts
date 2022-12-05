import getConfig from "next/config";

export type Config = {
  env: {
   
  };
};
const { publicRuntimeConfig } = getConfig() ?? {};
export const getPublicConfig = (): Config => publicRuntimeConfig;
