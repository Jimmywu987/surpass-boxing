import useTranslation from "next-translate/useTranslation";

import { useSession } from "next-auth/react";

import { ClassContent } from "@/features/classes/components/ClassContent";
import { trpc } from "@/utils/trpc";
import { useState } from "react";
import { isBefore, startOfDay } from "date-fns";
import { useRouter } from "next/router";

const ClassesPage = () => {
  const { t } = useTranslation("classes");
  const session: any = useSession();
  const router = useRouter();

  const { date: queryDate } = router.query;
  const now = startOfDay(new Date());

  const noSpecificDate =
    !queryDate ||
    isNaN(new Date(queryDate.toString()) as unknown as number) ||
    isBefore(new Date(queryDate.toString()), now);
  const isAuthenticated = session.status === "authenticated";

  const queryState = useState({
    skip: 0,
    date: noSpecificDate ? now.toString() : queryDate.toString(),
  });
  const [query] = queryState;
  const { data, isLoading } = trpc.lessonClassRouter.fetch.useQuery(
    { selectedDate: query.date },
    {
      enabled: isAuthenticated,
    }
  );
  const isAdmin: boolean = session.data?.user["admin"];

  const canViewClasses = !(
    (data && data.lessons.length === 0 && !isAdmin) ||
    !isAuthenticated
  );
  return (
    <ClassContent
      isLessonLoading={isLoading}
      lessonsData={data?.lessons ?? []}
      queryState={queryState}
      canViewClasses={canViewClasses}
    />
  );
};

export default ClassesPage;
