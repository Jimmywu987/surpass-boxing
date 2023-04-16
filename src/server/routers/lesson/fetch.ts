import { protectedProcedure } from "@/server/trpc";
import { prisma } from "@/services/prisma";
import { User } from "@prisma/client";

export const fetch = protectedProcedure.query(async ({ ctx }) => {
  const user = ctx.session.user as User;
  return prisma.lessons.findMany({
    where: {
      userId: user.id,
      expiryDate: {
        gte: new Date(),
      },
      lesson: {
        gt: 0,
      },
    },
  });
});
