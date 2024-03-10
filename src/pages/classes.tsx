import useTranslation from "next-translate/useTranslation";

import { useSession } from "next-auth/react";

import { ClassContent } from "@/features/classes/components/ClassContent";
import { trpc } from "@/utils/trpc";

const ClassesPage = () => {
  const { t } = useTranslation("classes");
  const session: any = useSession();

  const isAuthenticated = session.status === "authenticated";

  const { data } = trpc.lessonClassRouter.fetch.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const isAdmin: boolean = session.data?.user["admin"];
  if (
    !data ||
    (data.lessons.length === 0 && data.classes.length === 0 && !isAdmin)
  ) {
    return (
      <div className="text-center text-white mt-24">
        {t("please_contact_coach_to_get_class_info")}
      </div>
    );
  }
  return <ClassContent lessonsData={data.lessons} />;
};

export default ClassesPage;
