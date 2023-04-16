import { publicProcedure, router } from "@/server/trpc";
import { prisma } from "@/services/prisma";

export const newsRouter = router({
  fetch: publicProcedure.query(async () => {
    return prisma.news.findMany();
  }),
});
