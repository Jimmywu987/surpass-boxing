import { getTimeZone } from "@/helpers/getTimeZone";
import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { User } from "@prisma/client";

export const fetch = protectedProcedure.query(async ({ ctx }) => {
  const user = ctx.session.user as User;
  return prisma.lessons.findMany({
    where: {
      userId: user.id,
      expiryDate: {
        gte: getTimeZone(),
      },
      lesson: {
        gt: 0,
      },
    },
  });
});
