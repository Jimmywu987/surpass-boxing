/** @type {import('next').NextConfig} */
const nextTranslate = require("next-translate");

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "surpass-boxing.s3.ap-southeast-1.amazonaws.com",
      "lh3.googleusercontent.com",
    ],
  },
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
