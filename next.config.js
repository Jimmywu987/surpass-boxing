/** @type {import('next').NextConfig} */
const nextTranslate = require("next-translate");

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  publicRuntimeConfig: {},
  serverRuntimeConfig: {
    env: {
      REACT_APP_GOOGLE_ID: process.env.REACT_APP_GOOGLE_ID,
      REACT_APP_GOOGLE_SECRET: process.env.REACT_APP_GOOGLE_SECRET,
      JWT_SECRET: process.env.JWT_SECRET,
    },
  },
};

module.exports = nextTranslate(nextConfig);
