import { publicProcedure } from "@/server/trpc";
import { prisma } from "@/services/prisma";

export const fetchForPublic = publicProcedure.query(async () => {
  const coaches = await prisma.user.findMany({
    where: {
      shouldShow: true,
    },
    include: {
      coachInfos: true,
    },
  });
  return coaches.map((coach) => {
    return {
      coachInfos: coach.coachInfos,
      coachName: coach.username,
      profileImg: coach.profileImg,
    };
  });
});
