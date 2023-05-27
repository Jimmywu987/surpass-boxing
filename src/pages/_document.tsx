/* eslint-disable @next/next/google-font-display */
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="zh-HK">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.png"></link>
        <meta name="surpass-boxing" content="PWA App" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PWA App" />
        <meta name="description" content="Surpass boxing gym" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#fff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>
      <body className="bg-gray-800">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
