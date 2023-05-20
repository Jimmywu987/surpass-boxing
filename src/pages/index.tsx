import useTranslation from "next-translate/useTranslation";
import { signOut, useSession } from "next-auth/react";
import { trpc } from "utils/trpc";

export default function HomePage() {
  const { t } = useTranslation("common");

  return <div></div>;
}
