import useTranslation from "next-translate/useTranslation";

export default function HomePage() {
  const { t } = useTranslation("common");

  return <h1 className="">HI</h1>;
}

export async function getServerSideProps(context: any) {
  // Get external data from the file system, API, DB, etc.
  const data = { name: "jimmy" };

  // The value of the `props` key will be
  //  passed to the `Home` component
  return {
    props: data,
  };
}
