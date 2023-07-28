import useTranslation from "next-translate/useTranslation";

import { useSession } from "next-auth/react";

import { ClassContent } from "@/features/classes/components/ClassContent";
import { trpc } from "@/utils/trpc";

const ClassesPage = () => {
  const { t } = useTranslation("classes");
  const session = useSession();

  const isAuthenticated = session.status === "authenticated";

  const { data: lessonsData } = trpc.lessonClassRouter.fetch.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    }
  );
  if (!lessonsData || lessonsData.length === 0) {
    return (
      <div className="text-center text-white mt-24">
        {t("please_contact_coach_to_get_class_info")}
      </div>
    );
  }
  return <ClassContent lessonsData={lessonsData} />;
};

export default ClassesPage;
