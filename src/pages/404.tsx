import Link from "next/link";
import useTranslation from "next-translate/useTranslation";

export default function Custom404() {
  const { t } = useTranslation("common");

  return (
    <section className="mt-12">
      <h1 className=" mx-3 my-10 text-2xl font-bold text-white text-center">
        {t("404")}
      </h1>
      <div className="flex justify-center">
        <Link href="/" passHref className="no-underline px-2 py-1 text-white">
          {t("action.back")}
        </Link>
      </div>
    </section>
  );
}
