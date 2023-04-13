/**
 * This file contains the root router of your tRPC-backend
 */
import { publicProcedure, router } from "@/server/trpc";

export const appRouter = router({
  healthcheck: publicProcedure.query(() => "yay!"),
});

export type AppRouter = typeof appRouter;
