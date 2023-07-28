import { useSession } from "next-auth/react";

import { ClassContent } from "@/features/classes/components/ClassContent";
import { trpc } from "@/utils/trpc";

const LessonPage = () => {
  const session = useSession();

  const isAuthenticated = session.status === "authenticated";

  const { data: lessonsData } = trpc.lessonClassRouter.fetch.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    }
  );

  return <ClassContent lessonsData={lessonsData} />;
};

export default LessonPage;
