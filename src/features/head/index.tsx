import useTranslation from "next-translate/useTranslation";
import Head from "next/head";
import { useRouter } from "next/router";

export const HeadHtml = () => {
  const { lang } = useTranslation();
  const siteUrl = process.env.WEB_URL;
  const router = useRouter();
  const langCanonical = lang === "zh-HK" ? "" : "/en";
  const cleanPath = router.asPath.split("#")[0].split("?")[0];
  const path = router.asPath === "/" ? "" : cleanPath;
  const canonicalUrl = siteUrl + langCanonical + path;
  return (
    <Head>
      <title>Surpass - Boxing Gym</title>
      <meta
        name="viewport"
        content="initial-scale=1, viewport-fit=cover, width=device-width"
      />
      <meta name="description" content="A boxing gym in Hong Kong" />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" href={siteUrl + path} hrefLang="zh-HK" />
      <link rel="alternate" href={siteUrl + "/en" + path} hrefLang="en-HK" />
      <link rel="alternate" href={siteUrl + path} hrefLang="x-default" />
    </Head>
  );
};
