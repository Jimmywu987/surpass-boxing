import getConfig from "next/config";
import config from "@/../next.config";

export type Config = typeof config.publicRuntimeConfig;
const { publicRuntimeConfig } = getConfig() ?? {};
export const getPublicConfig = (): Config => publicRuntimeConfig;
