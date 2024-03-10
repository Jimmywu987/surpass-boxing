/** @type {import('next').NextConfig} */
const nextTranslate = require("next-translate-plugin");

const withNextPwa = require("next-pwa")({
  disable: process.env.NODE_ENV === "development",
  dest: "public",
  register: true,
  skipWaiting: true,
});

const nextConfig = nextTranslate({
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false };

    return config;
  },
  images: {
    domains: [
      `${process.env.S3_UPLOAD_BUCKET}.s3.amazonaws.com`,
      `${process.env.S3_UPLOAD_BUCKET}.s3.${process.env.S3_UPLOAD_REGION}.amazonaws.com`,
      "lh3.googleusercontent.com",
      "res.cloudinary.com",
    ],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    S3_UPLOAD_KEY: process.env.S3_UPLOAD_KEY,
    S3_UPLOAD_SECRET: process.env.S3_UPLOAD_SECRET,
    S3_UPLOAD_BUCKET: process.env.S3_UPLOAD_BUCKET,
    S3_UPLOAD_REGION: process.env.S3_UPLOAD_REGION,
    WEB_URL: process.env.WEB_URL,
  },
  publicRuntimeConfig: {},
  serverRuntimeConfig: {
    env: {
      REACT_APP_GOOGLE_ID: process.env.REACT_APP_GOOGLE_ID,
      REACT_APP_GOOGLE_SECRET: process.env.REACT_APP_GOOGLE_SECRET,
      JWT_SECRET: process.env.JWT_SECRET,
    },
  },
});

module.exports = withNextPwa(nextConfig);
