import useTranslation from "next-translate/useTranslation";
import { signOut, useSession } from "next-auth/react";

export default function HomePage() {
  const { t } = useTranslation("common");

  return (
    <div>
      <h1 className="text-white">HI</h1>
    </div>
  );
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
